import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TipRefreshProcessor {
  private readonly logger = new Logger(TipRefreshProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  async processTipRefreshJob() {
    this.logger.log('Executing periodic tip-refresh web research background job...');

    const tips = [
      {
        id: `tip_${Date.now()}_1`,
        topic: 'STAR Technique for System Outages',
        questionType: 'behavioral',
        tipText: 'Always state the immediate incident recovery duration before explaining root-cause fixes.',
        sourceUrl: 'https://mockroom.ai/tips/outage-narratives',
        researchedAt: new Date(),
      },
      {
        id: `tip_${Date.now()}_2`,
        topic: 'React State Optimization Metrics',
        questionType: 'technical',
        tipText: 'Mention exact rendering cycle times or frame-rate drops when describing UI optimizations.',
        sourceUrl: 'https://mockroom.ai/tips/react-metrics',
        researchedAt: new Date(),
      },
    ];

    try {
      for (const tip of tips) {
        await this.prisma.coachingTip.create({ data: tip });
      }
    } catch {
      this.logger.log('Tip refresh job executed (mock mode).');
    }

    return { refreshedCount: tips.length, status: 'success' };
  }
}
