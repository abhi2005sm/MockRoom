import { FakeTtsProvider } from '../../src/modules/ai/providers/fake/fake.tts';
import { ElevenLabsTtsProvider, TtsProviderError } from '../../src/modules/ai/providers/elevenlabs.tts';
import { ConfigService } from '@nestjs/config';

describe('TTS Providers Contract & Verification', () => {
  let fakeTts: FakeTtsProvider;

  beforeEach(() => {
    fakeTts = new FakeTtsProvider();
  });

  describe('FakeTtsProvider Contract', () => {
    it('should synthesize speech buffer matching TtsProvider interface', async () => {
      const buffer = await fakeTts.synthesizeSpeech({
        text: 'Hello candidate',
        voiceId: 'p-sarah',
      });
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('ElevenLabsTtsProvider Error Handling', () => {
    it('should throw typed TtsProviderError when TTS_API_KEY is missing', async () => {
      const mockConfig = { get: jest.fn().mockReturnValue(undefined) } as any;
      const elevenlabs = new ElevenLabsTtsProvider(mockConfig);

      await expect(
        elevenlabs.synthesizeSpeech({ text: 'Test', voiceId: 'p-sarah' })
      ).rejects.toThrow(TtsProviderError);
    });
  });
});
