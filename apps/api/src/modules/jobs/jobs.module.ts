import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { ParserService } from '../parser/parser.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, ParserService, PrismaService],
  exports: [JobsService],
})
export class JobsModule {}
