import { Module } from '@nestjs/common';
import { EvaluationController } from './evaluation.controller';
import { MetricsService } from './metrics.service';
import { ScoringService } from './scoring.service';
import { ReportService } from './report.service';
import { EvaluationProcessor } from './evaluation.processor';
import { PrismaService } from '../../database/prisma.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [EvaluationController],
  providers: [MetricsService, ScoringService, ReportService, EvaluationProcessor, PrismaService],
  exports: [ReportService, EvaluationProcessor],
})
export class EvaluationModule {}
