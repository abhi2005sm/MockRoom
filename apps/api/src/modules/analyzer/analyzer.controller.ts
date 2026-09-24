import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analyzer')
export class AnalyzerController {
  constructor(private readonly analyzerService: AnalyzerService) {}

  @UseGuards(JwtAuthGuard)
  @Get('personas')
  getPersonas() {
    return this.analyzerService.getAllPersonas();
  }

  @UseGuards(JwtAuthGuard)
  @Get('modes')
  getModes() {
    return this.analyzerService.getAllModes();
  }

  @UseGuards(JwtAuthGuard)
  @Get('company-sim')
  async getCompanySim(@Query('company') company: string, @Query('jobTitle') jobTitle: string) {
    return this.analyzerService.getCompanySimulation(company || 'TechCorp', jobTitle || 'Senior Frontend Engineer');
  }
}
