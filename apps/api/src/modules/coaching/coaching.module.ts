import { Module } from '@nestjs/common';
import { CoachingController } from './coaching.controller';
import { CoachingService } from './coaching.service';
import { LanguageCoachService } from './language-coach.service';
import { PracticeScoringService } from './practice-scoring.service';
import { CoachingProcessor } from './coaching.processor';
import { TipRefreshProcessor } from './tip-refresh.processor';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CoachingController],
  providers: [
    CoachingService,
    LanguageCoachService,
    PracticeScoringService,
    CoachingProcessor,
    TipRefreshProcessor,
    PrismaService,
  ],
  exports: [CoachingService, CoachingProcessor, TipRefreshProcessor],
})
export class CoachingModule {}
