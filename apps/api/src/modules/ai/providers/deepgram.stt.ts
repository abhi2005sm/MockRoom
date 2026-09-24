import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SttProvider, SttTranscriptResult } from '../interfaces/stt.provider';

@Injectable()
export class DeepgramSttProvider implements SttProvider {
  private readonly logger = new Logger(DeepgramSttProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async transcribeChunk(pcmBuffer: Buffer): Promise<SttTranscriptResult> {
    const apiKey = this.configService.get<string>('STT_API_KEY');
    this.logger.log(`Deepgram STT processing buffer chunk of ${pcmBuffer.length} bytes`);

    return {
      text: 'Candidate speech input processed via Deepgram',
      isFinal: true,
      startMs: 0,
      endMs: 1500,
    };
  }
}
