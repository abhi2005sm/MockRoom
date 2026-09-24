import { Injectable } from '@nestjs/common';
import { TtsProvider, TtsOptions } from '../../interfaces/tts.provider';

@Injectable()
export class FakeTtsProvider implements TtsProvider {
  async synthesizeSpeech(options: TtsOptions): Promise<Buffer> {
    // Return dummy 16kHz PCM audio buffer
    return Buffer.alloc(1024);
  }
}
