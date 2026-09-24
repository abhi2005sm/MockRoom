import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createJob(@Request() req, @Body() dto: CreateJobDto) {
    return this.jobsService.createJob(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getJob(@Request() req, @Param('id') id: string) {
    return this.jobsService.getJobById(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/analysis')
  async getJobAnalysis(@Request() req, @Param('id') id: string) {
    return this.jobsService.getJobAnalysis(id, req.user.userId);
  }
}
