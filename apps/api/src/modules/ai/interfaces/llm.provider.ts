export interface LlmCompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmProvider {
  generateCompletion(options: LlmCompletionOptions): Promise<string>;
  generateStructuredJson<T>(options: LlmCompletionOptions, schemaName: string): Promise<T>;
}
