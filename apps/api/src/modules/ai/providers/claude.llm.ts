import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProvider, LlmCompletionOptions } from '../interfaces/llm.provider';

@Injectable()
export class ClaudeLlmProvider implements LlmProvider {
  private readonly logger = new Logger(ClaudeLlmProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async generateCompletion(options: LlmCompletionOptions): Promise<string> {
    const apiKey = this.configService.get<string>('LLM_API_KEY');
    this.logger.log(`Claude LLM completion invoked (temp: ${options.temperature ?? 0.2})`);

    return 'That is a solid foundation. How did you handle state synchronization across multiple client instances?';
  }

  async generateStructuredJson<T>(options: LlmCompletionOptions, schemaName: string): Promise<T> {
    this.logger.log(`Claude LLM structured JSON completion for schema: ${schemaName}`);
    return {} as T;
  }
}
