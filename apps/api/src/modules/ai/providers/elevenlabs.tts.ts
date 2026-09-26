import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TtsProvider, TtsOptions } from '../interfaces/tts.provider';
import { PERSONA_PRESETS } from '../../orchestrator/prompts/personas';

export class TtsProviderError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(message);
    this.name = 'TtsProviderError';
  }
}

@Injectable()
export class ElevenLabsTtsProvider implements TtsProvider {
  private readonly logger = new Logger(ElevenLabsTtsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  private resolveVoiceId(voiceIdOrPersonaId: string): string {
    if (PERSONA_PRESETS[voiceIdOrPersonaId]) {
      return PERSONA_PRESETS[voiceIdOrPersonaId].voiceName;
    }
    return voiceIdOrPersonaId || '21m00Tcm4TlvDq8ikWAM'; // Default Rachel voice
  }

  async synthesizeSpeech(options: TtsOptions): Promise<Buffer> {
    const apiKey =
      this.configService.get<string>('TTS_API_KEY') || process.env.TTS_API_KEY;

    if (!apiKey) {
      throw new TtsProviderError(
        'TTS_API_KEY is not configured in environment variables'
      );
    }

    const voiceId = this.resolveVoiceId(options.voiceId);
    this.logger.log(
      `[ElevenLabsTtsProvider] Synthesizing speech for voiceId ${voiceId} (text length: ${options.text.length} chars)`
    );

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: options.text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `ElevenLabs API HTTP ${response.status}: ${errText || response.statusText}`
        );
      }

      if (!response.body) {
        throw new Error('ElevenLabs API returned an empty response body stream');
      }

      const chunks: Buffer[] = [];

      // Node.js 18+ Web ReadableStream handling
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          const chunkBuf = Buffer.from(value);
          chunks.push(chunkBuf);
          this.logger.log(
            `[ElevenLabsTtsProvider] Received TTS audio chunk of ${chunkBuf.length} bytes from vendor stream`
          );
          if (options.onAudioChunk) {
            options.onAudioChunk(chunkBuf);
          }
        }
      }

      const fullAudio = Buffer.concat(chunks);
      return fullAudio;
    } catch (err: any) {
      this.logger.warn(`[ElevenLabsTtsProvider] Speech synthesis failed: ${err.message}`);
      throw new TtsProviderError(`ElevenLabs TTS synthesis failed: ${err.message}`, err);
    }
  }

  async synthesizeSentenceStream(
    sentences: string[],
    voiceIdOrPersonaId: string,
    onAudioChunk: (chunk: Buffer) => void
  ): Promise<void> {
    for (const sentence of sentences) {
      if (!sentence.trim()) continue;
      await this.synthesizeSpeech({
        text: sentence.trim(),
        voiceId: voiceIdOrPersonaId,
        onAudioChunk,
      });
    }
  }
}
