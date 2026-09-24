import { Module } from '@nestjs/common';
import { AnalyzerController } from './analyzer.controller';
import { AnalyzerService } from './analyzer.service';
import { CompanyResearchService } from './company-research.service';

@Module({
  controllers: [AnalyzerController],
  providers: [AnalyzerService, CompanyResearchService],
  exports: [AnalyzerService],
})
export class AnalyzerModule {}
