import { Injectable, Logger } from '@nestjs/common';
import { buildJdParserPrompt, JdParserInput, JD_PARSER_PROMPT_VERSION } from './prompts/jd-parser.prompt';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  async parseJdAndResume(input: JdParserInput) {
    const prompt = buildJdParserPrompt(input);
    this.logger.log(`Executing JD Parser Prompt ${JD_PARSER_PROMPT_VERSION} for job: ${input.jobTitle}`);

    // Return structured fixture JSON (can be replaced by real Claude LLM provider)
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
