import { FakeSttProvider } from '../../src/modules/ai/providers/fake/fake.stt';
import { DeepgramSttProvider, SttProviderError } from '../../src/modules/ai/providers/deepgram.stt';
import { ConfigService } from '@nestjs/config';

describe('STT Providers Contract & Verification', () => {
  let fakeStt: FakeSttProvider;

  beforeEach(() => {
    fakeStt = new FakeSttProvider();
  });

  describe('FakeSttProvider Contract', () => {
    it('should transcribe audio buffer and return SttTranscriptResult with timestamps', async () => {
      const mockBuffer = Buffer.alloc(1024);
      const result = await fakeStt.transcribeChunk(mockBuffer);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('isFinal', true);
      expect(result).toHaveProperty('startMs');
      expect(result).toHaveProperty('endMs');
    });
  });

  describe('DeepgramSttProvider Error Handling', () => {
    it('should throw typed SttProviderError when STT_API_KEY is missing', async () => {
      const mockConfig = { get: jest.fn().mockReturnValue(undefined) } as any;
      const deepgram = new DeepgramSttProvider(mockConfig);

      await expect(deepgram.transcribeChunk(Buffer.alloc(512))).rejects.toThrow(
        SttProviderError
      );
    });
  });
});
