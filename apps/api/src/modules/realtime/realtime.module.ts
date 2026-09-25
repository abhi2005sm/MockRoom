import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthService } from '../auth/auth.service';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';
import { AiModule } from '../ai/ai.module';
import { PrismaService } from '../../database/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, OrchestratorModule, AiModule],
  providers: [RealtimeGateway, AuthService, PrismaService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
