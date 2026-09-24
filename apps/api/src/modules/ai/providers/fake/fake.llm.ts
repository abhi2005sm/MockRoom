import { Injectable } from '@nestjs/common';
import { LlmProvider, LlmCompletionOptions } from '../../interfaces/llm.provider';

@Injectable()
export class FakeLlmProvider implements LlmProvider {
  async generateCompletion(options: LlmCompletionOptions): Promise<string> {
    return 'That is a solid foundation. How did you measure performance improvements in that architecture?';
  }

  async generateStructuredJson<T>(options: LlmCompletionOptions, schemaName: string): Promise<T> {
    return {} as T;
  }
}
