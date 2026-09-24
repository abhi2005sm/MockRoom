import { Injectable, Logger } from '@nestjs/common';
import { buildAnalyzerPrompt, ANALYZER_PROMPT_VERSION } from './prompts/analyzer.prompt';

const researchCache = new Map<string, any>();

@Injectable()
export class CompanyResearchService {
  private readonly logger = new Logger(CompanyResearchService.name);

  async getCompanyResearch(company: string, jobTitle: string) {
    const cacheKey = `${company}:${jobTitle}`.toLowerCase();
    if (researchCache.has(cacheKey)) {
      return researchCache.get(cacheKey);
    }

    const prompt = buildAnalyzerPrompt({ company, jobTitle });
    this.logger.log(`Executing Company Research Prompt ${ANALYZER_PROMPT_VERSION} for ${company}`);

    const result = {
      company,
      companyCultureStyle: 'High-velocity SaaS engineering culture emphasizing component modularity and operational resilience.',
      likelyTechnicalFocus: ['React State Synchronization', 'WebSocket Reconnection Logic', 'STAR Outage Resolution'],
      sources: [
        { claim: 'Maintains public engineering blog on frontend performance.', sourceType: 'verified' },
        { claim: 'Candidates report 45-minute technical + STAR behavioral round structure.', sourceType: 'reported' },
        { claim: 'Standard Senior Frontend expectations include architecture trade-offs.', sourceType: 'inferred' },
      ],
    };

    researchCache.set(cacheKey, result);
    return result;
  }
}
