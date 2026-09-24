import { Injectable } from '@nestjs/common';
import { Judge0Client, CodeSubmissionInput } from './judge0.client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RunnerService {
  constructor(
    private readonly judge0Client: Judge0Client,
    private readonly prisma: PrismaService,
  ) {}

  async runSubmission(sessionId: string, questionId: string | undefined, input: CodeSubmissionInput) {
    const result = await this.judge0Client.executeCode(input);

    try {
      await this.prisma.submission.create({
        data: {
          sessionId,
          questionId,
          kind: 'code',
          language: input.language,
          content: input.sourceCode,
          result: result as any,
        },
      });
    } catch {
      // Ignore fallback log
    }

    return result;
  }
}
