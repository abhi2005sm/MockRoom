import { Injectable, Logger } from '@nestjs/common';
import { ReportService } from './report.service';

@Injectable()
export class EvaluationProcessor {
  private readonly logger = new Logger(EvaluationProcessor.name);

  constructor(private readonly reportService: ReportService) {}

  async processSessionEvaluation(job: { data: { sessionId: string } }) {
    const { sessionId } = job.data;
    this.logger.log(`BullMQ Processing evaluation job for session ${sessionId}`);

    try {
      const report = await this.reportService.generateReport(sessionId);
      this.logger.log(`Evaluation report generated successfully for session ${sessionId} (Score: ${report.overallScore})`);
      return report;
    } catch (err) {
      this.logger.error(`Evaluation job failed for session ${sessionId}: ${err.message}`);
      throw err;
    }
  }
}
