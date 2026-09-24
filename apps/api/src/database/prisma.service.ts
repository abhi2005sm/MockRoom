import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Attempt database connection if database is running
    try {
      await this.$connect();
    } catch (e) {
      console.warn('Prisma database connection delayed or skipped:', e.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
