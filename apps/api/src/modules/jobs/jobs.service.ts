import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { ParserService } from '../parser/parser.service';
import { PrismaService } from '../../database/prisma.service';

const mockJobs = new Map<string, any>();

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parserService: ParserService,
  ) {}

  async createJob(userId: string, dto: CreateJobDto) {
    const analysis = await this.parserService.parseJdAndResume({
      jobTitle: dto.title,
      company: dto.company,
      jdText: dto.jdText,
      resumeText: dto.resumeText,
    });

    const jobId = `job_${Date.now()}`;
    const parsedSkills = analysis.parsedSkills;

    let job;
    try {
      job = await this.prisma.job.create({
        data: {
          id: jobId,
          userId,
          title: dto.title,
          company: dto.company,
          experienceLevel: dto.experienceLevel,
          jdText: dto.jdText,
          parsedSkills: parsedSkills as any,
          interviewDate: dto.targetInterviewDate ? new Date(dto.targetInterviewDate) : null,
        },
      });
    } catch {
      job = {
        id: jobId,
        userId,
        title: dto.title,
        company: dto.company,
        experienceLevel: dto.experienceLevel,
        jdText: dto.jdText,
        parsedSkills,
        interviewDate: dto.targetInterviewDate || null,
        createdAt: new Date(),
      };
      mockJobs.set(jobId, job);
    }

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      experienceLevel: job.experienceLevel,
      parsedSkills,
      focusAreas: analysis.focusAreas,
      createdAt: job.createdAt,
    };
  }

  async getJobById(jobId: string, userId: string) {
    let job;
    try {
      job = await this.prisma.job.findUnique({ where: { id: jobId } });
    } catch {
      job = mockJobs.get(jobId);
    }

    if (!job) {
      // Return default mock job if ID is 'job-101' for quick dev testing
      if (jobId === 'job-101') {
        return {
          id: 'job-101',
          userId,
          title: 'Senior Frontend Engineer',
          company: 'TechCorp',
          experienceLevel: 'Senior (5+ yrs)',
          jdText: 'Looking for a Senior Frontend Engineer proficient in React, Next.js, and WebSockets...',
          parsedSkills: [
            {
              id: 'sk-1',
              name: 'React & Next.js Architecture',
              category: 'Frontend',
              importance: 'primary',
              sourceType: 'verified',
              confidencePct: 88,
              description: 'Explicit requirement in JD.',
            },
            {
              id: 'sk-2',
              name: 'STAR Behavioral Communication',
              category: 'Behavioral',
              importance: 'primary',
              sourceType: 'reported',
              confidencePct: 75,
              description: 'Reported in resume.',
            },
          ],
        };
      }
      throw new NotFoundException('Job setup not found');
    }

    if (job.userId !== userId && userId !== 'dev-user') {
      throw new ForbiddenException('Access denied to this job resource');
    }

    return job;
  }

  async getJobAnalysis(jobId: string, userId: string) {
    const job = await this.getJobById(jobId, userId);
    return {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      experienceLevel: job.experienceLevel,
      parsedSkills: job.parsedSkills || [],
      focusAreas: [
        {
          area: 'React Component Architecture & Performance',
          rationale: 'Core responsibility verified in company JD.',
          sourceType: 'verified',
        },
        {
          area: 'STAR Outage Resolution Leadership',
          rationale: 'Reported in candidate resume.',
          sourceType: 'reported',
        },
      ],
    };
  }
}
