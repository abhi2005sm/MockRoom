import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { PlansModule } from './modules/plans/plans.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { OrchestratorModule } from './modules/orchestrator/orchestrator.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AiModule } from './modules/ai/ai.module';
import { RunnerModule } from './modules/runner/runner.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';
import { CoachingModule } from './modules/coaching/coaching.module';
import { AnalyzerModule } from './modules/analyzer/analyzer.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    JobsModule,
    PlansModule,
    SessionsModule,
    OrchestratorModule,
    RealtimeModule,
    AiModule,
    RunnerModule,
    EvaluationModule,
    CoachingModule,
    AnalyzerModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
