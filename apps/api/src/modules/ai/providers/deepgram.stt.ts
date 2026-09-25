import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { SttProvider, SttTranscriptResult } from '../interfaces/stt.provider';

export class SttProviderError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(message);
    this.name = 'SttProviderError';
  }
}

@Injectable()
export class DeepgramSttProvider implements SttProvider {
  private readonly logger = new Logger(DeepgramSttProvider.name);
  private deepgramClient: ReturnType<typeof createClient> | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): ReturnType<typeof createClient> {
    if (this.deepgramClient) return this.deepgramClient;

    const apiKey =
      this.configService.get<string>('STT_API_KEY') || process.env.STT_API_KEY;

    if (!apiKey) {
      throw new SttProviderError(
        'STT_API_KEY is not configured in environment variables'
      );
    }

    this.deepgramClient = createClient(apiKey);
    return this.deepgramClient;
  }

  async transcribeChunk(pcmBuffer: Buffer): Promise<SttTranscriptResult> {
    this.logger.log(`[DeepgramSttProvider] Processing audio chunk of ${pcmBuffer.length} bytes`);

    const attemptTranscribe = async (): Promise<SttTranscriptResult> => {
      const client = this.getClient();
      const { result, error } = await client.listen.prerecorded.transcribeFile(
        pcmBuffer,
        {
          model: 'nova-2',
          smart_format: true,
          punctuate: true,
          utterances: true,
        }
      );

      if (error || !result) {
        throw new Error(error?.message || 'Deepgram returned an empty result');
      }

      const channel = result.results?.channels?.[0];
      const alternative = channel?.alternatives?.[0];

      const text = alternative?.transcript || '';
      const words = (alternative?.words || []).map((w) => ({
        word: w.word,
        startMs: Math.round((w.start || 0) * 1000),
        endMs: Math.round((w.end || 0) * 1000),
        confidence: w.confidence,
      }));

      const startMs = words.length > 0 ? words[0].startMs : 0;
      const endMs = words.length > 0 ? words[words.length - 1].endMs : 1500;

      return {
        text,
        isFinal: true,
        startMs,
        endMs,
        words,
      };
    };

    try {
      return await attemptTranscribe();
    } catch (firstErr: any) {
      this.logger.warn(
        `[DeepgramSttProvider] Transcription attempt failed: ${firstErr.message}. Retrying connection once...`
      );
      try {
        return await attemptTranscribe();
      } catch (secondErr: any) {
        this.logger.error(
          `[DeepgramSttProvider] Transcription failed on retry: ${secondErr.message}`
        );
        throw new SttProviderError(
          `Deepgram STT transcription failed: ${secondErr.message}`,
          secondErr
        );
      }
    }
  }

  createLiveStream(
    onInterim: (text: string) => void,
    onFinal: (result: SttTranscriptResult) => void,
    onError?: (err: Error) => void
  ) {
    const client = this.getClient();
    let liveSocket = client.listen.live({
      model: 'nova-2',
      smart_format: true,
      punctuate: true,
      interim_results: true,
      encoding: 'linear16',
      sample_rate: 16000,
      channels: 1,
    });

    let isConnected = false;
    let reconnectAttempts = 0;

    const setupListeners = (socket: typeof liveSocket) => {
      socket.on(LiveTranscriptionEvents.Open, () => {
        isConnected = true;
        reconnectAttempts = 0;
        this.logger.log('[DeepgramSttProvider] Live streaming WebSocket connected');
      });

      socket.on(LiveTranscriptionEvents.Transcript, (data) => {
        const alternative = data.channel?.alternatives?.[0];
        const text = alternative?.transcript || '';
        if (!text) return;

        if (data.is_final) {
          const words = (alternative?.words || []).map((w: any) => ({
            word: w.word,
            startMs: Math.round((w.start || 0) * 1000),
            endMs: Math.round((w.end || 0) * 1000),
            confidence: w.confidence,
          }));
          const startMs = words.length > 0 ? words[0].startMs : 0;
          const endMs = words.length > 0 ? words[words.length - 1].endMs : 0;

          onFinal({
            text,
            isFinal: true,
            startMs,
            endMs,
            words,
          });
        } else {
          onInterim(text);
        }
      });

      socket.on(LiveTranscriptionEvents.Error, (err) => {
        this.logger.warn(`[DeepgramSttProvider] Live WebSocket error: ${err.message || err}`);
        if (reconnectAttempts < 1) {
          reconnectAttempts++;
          this.logger.log('[DeepgramSttProvider] Attempting automatic reconnect to Deepgram live socket...');
          try {
            liveSocket = client.listen.live({
              model: 'nova-2',
              smart_format: true,
              punctuate: true,
              interim_results: true,
              encoding: 'linear16',
              sample_rate: 16000,
              channels: 1,
            });
            setupListeners(liveSocket);
          } catch (recErr: any) {
            if (onError) onError(new SttProviderError(`Reconnect failed: ${recErr.message}`));
          }
        } else {
          if (onError) onError(new SttProviderError(`Deepgram connection lost: ${err.message || err}`));
        }
      });

      socket.on(LiveTranscriptionEvents.Close, () => {
        isConnected = false;
        this.logger.log('[DeepgramSttProvider] Live WebSocket closed');
      });
    };

    setupListeners(liveSocket);

    return {
      sendChunk: (chunk: Buffer) => {
        if (liveSocket && isConnected) {
          liveSocket.send(chunk as any);
        }
      },
      finish: () => {
        if (liveSocket) {
          liveSocket.finish();
        }
      },
    };
  }
}
