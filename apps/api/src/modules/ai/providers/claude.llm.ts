import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { LlmProvider, LlmCompletionOptions } from '../interfaces/llm.provider';
import { SCHEMA_REGISTRY } from '../schemas/ai-schemas';

export class LlmProviderError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(message);
    this.name = 'LlmProviderError';
  }
}

@Injectable()
export class ClaudeLlmProvider implements LlmProvider {
  private readonly logger = new Logger(ClaudeLlmProvider.name);
  private anthropicClient: Anthropic | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): Anthropic {
    if (this.anthropicClient) return this.anthropicClient;

    const apiKey =
      this.configService.get<string>('LLM_API_KEY') || process.env.LLM_API_KEY;

    if (!apiKey) {
      throw new LlmProviderError(
        'LLM_API_KEY is not configured in environment variables'
      );
    }

    this.anthropicClient = new Anthropic({ apiKey });
    return this.anthropicClient;
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new LlmProviderError(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timer);
    });
  }

  async generateCompletion(options: LlmCompletionOptions): Promise<string> {
    const client = this.getClient();
    const promptVer = options.promptVersion || 'v2.1.0';
    this.logger.log(
      `[ClaudeLlmProvider] Invoking completion (${promptVer}) temp: ${options.temperature ?? 0.2}, streaming: ${!!options.onChunk}`
    );

    const timeoutMs = options.onChunk ? 30000 : 10000;

    const requestTask = (async () => {
      if (options.onChunk) {
        const stream = await client.messages.create({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: options.maxTokens ?? 1024,
          temperature: options.temperature ?? 0.2,
          system: options.systemPrompt,
          messages: [{ role: 'user', content: options.userPrompt }],
          stream: true,
        });

        let fullText = '';
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const deltaText = chunk.delta.text;
            fullText += deltaText;
            if (options.onChunk) {
              options.onChunk(deltaText);
            }
          }
        }
        return fullText;
      } else {
        const response = await client.messages.create({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: options.maxTokens ?? 1024,
          temperature: options.temperature ?? 0.2,
          system: options.systemPrompt,
          messages: [{ role: 'user', content: options.userPrompt }],
        });

        const textContent = response.content
          .filter((c) => c.type === 'text')
          .map((c) => (c as { text: string }).text)
          .join('');

        return textContent;
      }
    })();

    try {
      return await this.withTimeout(requestTask, timeoutMs, `Claude LLM completion (${promptVer})`);
    } catch (err: any) {
      if (err instanceof LlmProviderError) throw err;
      this.logger.error(`[ClaudeLlmProvider] API call failed: ${err.message}`, err.stack);
      throw new LlmProviderError(`Claude API completion failed: ${err.message}`, err);
    }
  }

  async generateStructuredJson<T>(
    options: LlmCompletionOptions,
    schemaName: string
  ): Promise<T> {
    const promptVer = options.promptVersion || 'v2.1.0';
    this.logger.log(
      `[ClaudeLlmProvider] Requesting structured JSON (${promptVer}) for schema: ${schemaName}`
    );

    const schema = SCHEMA_REGISTRY[schemaName];
    const systemPromptWithJsonInstruction = `${options.systemPrompt}\n\nIMPORTANT: You must respond ONLY with a raw, valid JSON object matching the requested schema. Do not include markdown code fence formatting (e.g. do NOT wrap in \`\`\`json).`;

    const attemptCall = async (userPrompt: string): Promise<T> => {
      const completionText = await this.generateCompletion({
        ...options,
        systemPrompt: systemPromptWithJsonInstruction,
        userPrompt,
        temperature: options.temperature ?? 0.1,
      });

      const cleanedJson = completionText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');

      let rawObj: any;
      try {
        rawObj = JSON.parse(cleanedJson);
      } catch (parseErr: any) {
        throw new Error(`Invalid JSON output: ${parseErr.message}`);
      }

      if (schema) {
        const validationResult = schema.safeParse(rawObj);
        if (!validationResult.success) {
          const formattedErr = validationResult.error.issues
            .map((i) => `${i.path.join('.')}: ${i.message}`)
            .join('; ');
          throw new Error(`Zod Schema Validation Failed: ${formattedErr}`);
        }
        return validationResult.data as T;
      }

      return rawObj as T;
    };

    try {
      return await attemptCall(options.userPrompt);
    } catch (firstErr: any) {
      this.logger.warn(
        `[ClaudeLlmProvider] Schema validation/parsing failed for ${schemaName} on first attempt: ${firstErr.message}. Retrying once with stricter instructions...`
      );

      const retryUserPrompt = `${options.userPrompt}\n\nCRITICAL FIX REQUIRED: Your previous response was rejected due to the following JSON/schema error:\n"${firstErr.message}"\n\nPlease re-format your response into strictly valid JSON matching the exact schema required.`;

      try {
        return await attemptCall(retryUserPrompt);
      } catch (secondErr: any) {
        this.logger.error(
          `[ClaudeLlmProvider] Schema validation failed for ${schemaName} on retry attempt: ${secondErr.message}`
        );
        throw new LlmProviderError(
          `Structured JSON generation failed validation after retry for schema '${schemaName}': ${secondErr.message}`,
          secondErr
        );
      }
    }
  }
}
