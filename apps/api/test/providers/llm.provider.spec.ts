import { FakeLlmProvider } from '../../src/modules/ai/providers/fake/fake.llm';
import { ClaudeLlmProvider, LlmProviderError } from '../../src/modules/ai/providers/claude.llm';
import { ConfigService } from '@nestjs/config';

describe('LLM Providers Contract & Verification', () => {
  let fakeLlm: FakeLlmProvider;
  let claudeLlm: ClaudeLlmProvider;
  let mockConfig: ConfigService;

  beforeEach(() => {
    fakeLlm = new FakeLlmProvider();
    mockConfig = {
      get: jest.fn((key: string) => {
        if (key === 'LLM_API_KEY') return process.env.LLM_API_KEY || undefined;
        return undefined;
      }),
    } as any;
    claudeLlm = new ClaudeLlmProvider(mockConfig);
  });

  describe('FakeLlmProvider Contract', () => {
    it('should generate text completion matching LlmProvider interface', async () => {
      const result = await fakeLlm.generateCompletion({
        systemPrompt: 'Test system prompt',
        userPrompt: 'Hello interviewer',
      });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate structured JSON matching LlmProvider interface', async () => {
      const result = await fakeLlm.generateStructuredJson<any>(
        { systemPrompt: 'Test', userPrompt: 'Test' },
        'jd-parser'
      );
      expect(result).toBeDefined();
    });
  });

  describe('ClaudeLlmProvider Error & Validation Handling', () => {
    it('should throw typed LlmProviderError if LLM_API_KEY is missing', async () => {
      const emptyConfig = { get: jest.fn().mockReturnValue(undefined) } as any;
      const providerNoKey = new ClaudeLlmProvider(emptyConfig);

      await expect(
        providerNoKey.generateCompletion({
          systemPrompt: 'Test',
          userPrompt: 'Test',
        })
      ).rejects.toThrow(LlmProviderError);
    });
  });
});
