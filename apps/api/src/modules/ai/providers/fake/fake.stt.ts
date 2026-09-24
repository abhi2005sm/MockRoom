import { Injectable } from '@nestjs/common';
import { SttProvider, SttTranscriptResult } from '../../interfaces/stt.provider';

@Injectable()
export class FakeSttProvider implements SttProvider {
  async transcribeChunk(pcmBuffer: Buffer): Promise<SttTranscriptResult> {
    return {
      text: 'I am ready to practice my technical interview.',
      isFinal: true,
      startMs: 0,
      endMs: 2500,
    };
  }
}
