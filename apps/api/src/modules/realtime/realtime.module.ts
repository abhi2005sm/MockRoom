import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthService } from '../auth/auth.service';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { TurnManager } from '../orchestrator/turn-manager';
import { PrismaService } from '../../database/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [RealtimeGateway, AuthService, OrchestratorService, TurnManager, PrismaService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
