import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { AuthService } from '../auth/auth.service';
import { PlansService } from '../plans/plans.service';
import { JobsService } from '../jobs/jobs.service';
import { ParserService } from '../parser/parser.service';
import { TurnManager } from '../orchestrator/turn-manager';
import { PrismaService } from '../../database/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    AuthService,
    PlansService,
    JobsService,
    ParserService,
    TurnManager,
    PrismaService,
  ],
  exports: [SessionsService],
})
export class SessionsModule {}
