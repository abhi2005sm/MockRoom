import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sessions')
export class EvaluationController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id/report')
  async getReport(@Param('id') id: string) {
    return this.reportService.getReportBySessionId(id);
  }
}
