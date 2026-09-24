import { Injectable, Logger } from '@nestjs/common';
import { CoachingService } from './coaching.service';

@Injectable()
export class CoachingProcessor {
  private readonly logger = new Logger(CoachingProcessor.name);

  constructor(private readonly coachingService: CoachingService) {}

  async processCoachingGeneration(job: { data: { sessionId: string } }) {
    const { sessionId } = job.data;
    this.logger.log(`BullMQ Processing coaching generation for session ${sessionId}`);

    try {
      const sections = await this.coachingService.generateCoachingSections(sessionId);
      this.logger.log(`Coaching sections created successfully for session ${sessionId} (${sections.length} cards)`);
      return sections;
    } catch (err) {
      this.logger.error(`Coaching generation failed for session ${sessionId}: ${err.message}`);
      throw err;
    }
  }
}
