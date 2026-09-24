import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('analytics/weak-areas')
  async getWeakAreas(@Request() req) {
    return this.analyticsService.getWeakAreas(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/retry-queue')
  async getRetryQueue(@Request() req) {
    return this.analyticsService.getRetryQueue(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/progress')
  async getProgress(@Request() req) {
    return this.analyticsService.getProgressTrends(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('answers/search')
  async searchAnswers(@Request() req, @Query('q') query?: string) {
    return this.analyticsService.searchAnswerLibrary(req.user.userId, query || '');
  }
}
