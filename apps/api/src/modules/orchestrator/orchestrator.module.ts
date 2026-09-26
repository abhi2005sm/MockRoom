import { Module } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { TurnManager } from './turn-manager';
import { WarningService } from './warning.service';
import { PrismaService } from '../../database/prisma.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [OrchestratorService, TurnManager, WarningService, PrismaService],
  exports: [OrchestratorService, TurnManager, WarningService],
})
export class OrchestratorModule {}
