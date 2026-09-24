import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { JobsService } from '../jobs/jobs.service';
import { ParserService } from '../parser/parser.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [PlansController],
  providers: [PlansService, JobsService, ParserService, PrismaService],
  exports: [PlansService],
})
export class PlansModule {}
