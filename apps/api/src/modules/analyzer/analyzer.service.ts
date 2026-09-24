import { Injectable } from '@nestjs/common';
import { PERSONA_PRESETS } from '../orchestrator/prompts/personas';
import { MODE_CONFIGS } from '../plans/mode-configs';
import { CompanyResearchService } from './company-research.service';

@Injectable()
export class AnalyzerService {
  constructor(private readonly companyResearch: CompanyResearchService) {}

  getAllPersonas() {
    return Object.values(PERSONA_PRESETS);
  }

  getPersonaById(id: string) {
    return PERSONA_PRESETS[id] || PERSONA_PRESETS['p-sarah'];
  }

  getAllModes() {
    return Object.values(MODE_CONFIGS);
  }

  async getCompanySimulation(company: string, jobTitle: string) {
    return this.companyResearch.getCompanyResearch(company, jobTitle);
  }
}
