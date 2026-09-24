import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSession(@Request() req, @Body() dto: CreateSessionDto) {
    return this.sessionsService.createSession(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserSessions(@Request() req) {
    return this.sessionsService.getUserSessions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSession(@Request() req, @Param('id') id: string) {
    return this.sessionsService.getSessionById(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/end')
  async endSession(@Request() req, @Param('id') id: string) {
    return this.sessionsService.endSession(id, req.user.userId);
  }
}
