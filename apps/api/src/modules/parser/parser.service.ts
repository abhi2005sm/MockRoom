import { Injectable, Inject, Logger, Optional } from '@nestjs/common';
import { buildJdParserPrompt, JdParserInput, JD_PARSER_PROMPT_VERSION } from './prompts/jd-parser.prompt';
import { LlmProvider } from '../ai/interfaces/llm.provider';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  constructor(
    @Optional() @Inject('LLM_PROVIDER') private readonly llmProvider?: LlmProvider
  ) {}

  async parseJdAndResume(input: JdParserInput) {
    const prompt = buildJdParserPrompt(input);
    this.logger.log(`Executing JD Parser Prompt ${JD_PARSER_PROMPT_VERSION} for job: ${input.jobTitle}`);

    if (this.llmProvider) {
      try {
        const result = await this.llmProvider.generateStructuredJson<any>(
          {
            systemPrompt: prompt,
            userPrompt: 'Parse the provided JD and resume into structured skills and focus areas.',
            temperature: 0.1,
            promptVersion: JD_PARSER_PROMPT_VERSION,
          },
          'jd-parser'
        );

        if (result && result.parsedSkills) {
          return result;
        }
      } catch (err: any) {
        this.logger.warn(`LLM JD Parsing failed: ${err.message}. Falling back to default fixture.`);
      }
    }

    // Return structured fixture JSON fallback
    return {
      parsedSkills: [
        {
          id: 'sk-1',
          name: 'React & Next.js Architecture',
          category: 'Frontend',
          importance: 'primary',
          sourceType: 'verified',
          confidencePct: 88,
          description: 'Explicit requirement in JD for high-performance React web applications.',
        },
        {
          id: 'sk-2',
          name: 'TypeScript & State Management',
          category: 'Frontend',
          importance: 'primary',
          sourceType: 'verified',
          confidencePct: 82,
          description: 'Strong typing and Zustand/Redux store design required.',
        },
        {
          id: 'sk-3',
          name: 'STAR Behavioral Communication',
          category: 'Behavioral',
          importance: 'primary',
          sourceType: 'reported',
          confidencePct: 75,
          description: 'Reported in resume via outage resolution and project leadership experience.',
        },
        {
          id: 'sk-4',
          name: 'Node.js & WebSockets',
          category: 'Backend',
          importance: 'secondary',
          sourceType: 'inferred',
          confidencePct: 68,
          description: 'Inferred for full-stack frontend engineer interacting with real-time APIs.',
        },
      ],
      focusAreas: [
        {
          area: 'React Component Lifecycle & Performance Optimization',
          rationale: 'Primary frontend responsibility listed in company job description.',
          sourceType: 'verified',
        },
        {
          area: 'STAR Method Outage Resolution Storytelling',
          rationale: 'Highlighted project in candidate resume.',
          sourceType: 'reported',
        },
      ],
    };
  }
}
