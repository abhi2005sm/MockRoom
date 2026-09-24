import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CoachingService } from './coaching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('coaching')
export class CoachingController {
  constructor(private readonly coachingService: CoachingService) {}

  @UseGuards(JwtAuthGuard)
  @Get('sections')
  async getSections(
    @Query('sessionId') sessionId?: string,
    @Query('sectionType') sectionType?: string,
    @Query('practiced') practiced?: string
  ) {
    const isPracticed = practiced !== undefined ? practiced === 'true' : undefined;
    return this.coachingService.getCoachingSections(sessionId, sectionType, isPracticed);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sections/:id')
  async getSectionById(@Param('id') id: string) {
    return this.coachingService.getCoachingSectionById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sections/:id/practice')
  async submitPractice(
    @Param('id') id: string,
    @Body() body: { attemptText: string; attemptAudioUrl?: string }
  ) {
    return this.coachingService.submitPracticeAttempt(id, body.attemptText, body.attemptAudioUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('trends')
  async getTrends() {
    return this.coachingService.getCoachingTrends();
  }
}
