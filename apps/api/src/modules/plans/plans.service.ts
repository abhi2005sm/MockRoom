import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { MODE_CONFIGS } from './mode-configs';
import { JobsService } from '../jobs/jobs.service';
import { PrismaService } from '../../database/prisma.service';

const mockPlans = new Map<string, any>();

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
  ) {}

  async createPlan(userId: string, dto: CreatePlanDto) {
    const job = await this.jobsService.getJobById(dto.jobId, userId);

    const planId = `plan_${Date.now()}`;
    const mode = (dto.mode || 'realistic') as any;
    const personaId = dto.personaId || 'p-sarah';

    const rounds = [
      { id: 'r1', name: 'Warm-up & Resume Intro', durationMinutes: 5, questionCount: 1, topics: ['Self-Introduction'] },
      { id: 'r2', name: 'STAR Behavioral Deep-Dive', durationMinutes: 10, questionCount: 2, topics: ['Outage Resolution', 'Cross-functional Conflict'] },
      { id: 'r3', name: 'Technical & Architecture', durationMinutes: 15, questionCount: 2, topics: ['React Component Architecture', 'WebSocket State Synchronization'] },
      { id: 'r4', name: 'Live Coding Lab', durationMinutes: 10, questionCount: 1, topics: ['Array Debounce Utility'] },
      { id: 'r5', name: 'Candidate Questions & Closing', durationMinutes: 5, questionCount: 1, topics: ['Team Culture'] },
    ];

    let plan;
    try {
      plan = await this.prisma.interviewPlan.create({
        data: {
          id: planId,
          jobId: job.id,
          difficulty: dto.difficulty || 'Medium-Hard',
          rounds: rounds as any,
          totalQuestions: 7,
          durationMinutes: 45,
          mode,
          personaId,
        },
      });
    } catch {
      plan = {
        id: planId,
        jobId: job.id,
        difficulty: dto.difficulty || 'Medium-Hard',
        rounds,
        totalQuestions: 7,
        durationMinutes: 45,
        mode,
        personaId,
        createdAt: new Date(),
      };
      mockPlans.set(planId, plan);
    }

    return {
      id: plan.id,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      difficulty: plan.difficulty,
      mode: plan.mode,
      modeConfig: MODE_CONFIGS[plan.mode as keyof typeof MODE_CONFIGS] || MODE_CONFIGS.realistic,
      personaId: plan.personaId,
      durationMinutes: plan.durationMinutes,
      totalQuestions: plan.totalQuestions,
      rounds: plan.rounds,
      createdAt: plan.createdAt,
    };
  }

  async updatePlan(planId: string, userId: string, dto: UpdatePlanDto) {
    let plan = await this.getPlanById(planId, userId);
    const updated = {
      ...plan,
      mode: dto.mode || plan.mode,
      personaId: dto.personaId || plan.personaId,
      difficulty: dto.difficulty || plan.difficulty,
      modeConfig: MODE_CONFIGS[(dto.mode || plan.mode) as keyof typeof MODE_CONFIGS],
    };

    try {
      await this.prisma.interviewPlan.update({
        where: { id: planId },
        data: {
          mode: updated.mode,
          personaId: updated.personaId,
          difficulty: updated.difficulty,
        },
      });
    } catch {
      mockPlans.set(planId, updated);
    }

    return updated;
  }

  async getPlanById(planId: string, userId: string) {
    let plan;
    try {
      plan = await this.prisma.interviewPlan.findUnique({ where: { id: planId } });
    } catch {
      plan = mockPlans.get(planId);
    }

    if (!plan) {
      // Mock plan fallback for 'job-101'
      return {
        id: planId || 'plan-101',
        jobId: 'job-101',
        jobTitle: 'Senior Frontend Engineer',
        company: 'TechCorp',
        difficulty: 'Medium-Hard',
        mode: 'realistic',
        modeConfig: MODE_CONFIGS.realistic,
        personaId: 'p-sarah',
        durationMinutes: 45,
        totalQuestions: 7,
        rounds: [
          { id: 'r1', name: 'Warm-up & Resume Intro', durationMinutes: 5, questionCount: 1, topics: ['Self-Introduction'] },
          { id: 'r2', name: 'STAR Behavioral Deep-Dive', durationMinutes: 10, questionCount: 2, topics: ['Outage Resolution'] },
          { id: 'r3', name: 'Technical & Architecture', durationMinutes: 15, questionCount: 2, topics: ['React Architecture'] },
          { id: 'r4', name: 'Live Coding Lab', durationMinutes: 10, questionCount: 1, topics: ['Debounce Algorithm'] },
          { id: 'r5', name: 'Closing', durationMinutes: 5, questionCount: 1, topics: ['Questions'] },
        ],
      };
    }

    return {
      ...plan,
      modeConfig: MODE_CONFIGS[plan.mode as keyof typeof MODE_CONFIGS] || MODE_CONFIGS.realistic,
    };
  }
}
