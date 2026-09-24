import { Controller, Post, Patch, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPlan(@Request() req, @Body() dto: CreatePlanDto) {
    return this.plansService.createPlan(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePlan(@Request() req, @Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.updatePlan(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPlan(@Request() req, @Param('id') id: string) {
    return this.plansService.getPlanById(id, req.user.userId);
  }
}
