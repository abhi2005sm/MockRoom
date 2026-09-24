import { Module } from '@nestjs/common';
import { RunnerService } from './runner.service';
import { Judge0Client } from './judge0.client';
import { PrismaService } from '../../database/prisma.service';

@Module({
  providers: [RunnerService, Judge0Client, PrismaService],
  exports: [RunnerService],
})
export class RunnerModule {}
