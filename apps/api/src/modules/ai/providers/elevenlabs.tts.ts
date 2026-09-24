import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TtsProvider, TtsOptions } from '../interfaces/tts.provider';

@Injectable()
export class ElevenLabsTtsProvider implements TtsProvider {
  private readonly logger = new Logger(ElevenLabsTtsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async synthesizeSpeech(options: TtsOptions): Promise<Buffer> {
    const apiKey = this.configService.get<string>('TTS_API_KEY');
    this.logger.log(`ElevenLabs TTS synthesizing voice ${options.voiceId} for text len ${options.text.length}`);

    return Buffer.alloc(2048);
  }
}
