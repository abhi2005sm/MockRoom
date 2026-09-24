import { Module } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { TurnManager } from './turn-manager';
import { PrismaService } from '../../database/prisma.service';

@Module({
  providers: [OrchestratorService, TurnManager, PrismaService],
  exports: [OrchestratorService, TurnManager],
})
export class OrchestratorModule {}
