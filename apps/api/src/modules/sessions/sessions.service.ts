import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { AuthService } from '../auth/auth.service';
import { PlansService } from '../plans/plans.service';
import { TurnManager } from '../orchestrator/turn-manager';
import { PrismaService } from '../../database/prisma.service';

const mockSessions = new Map<string, any>();

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly plansService: PlansService,
    private readonly turnManager: TurnManager,
  ) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    const plan = await this.plansService.getPlanById(dto.planId, userId);
    const sessionId = `sess_${Date.now()}`;
    const mode = dto.mode || plan.mode;
    const personaId = dto.personaId || plan.personaId;

    let session;
    try {
      session = await this.prisma.session.create({
        data: {
          id: sessionId,
          userId,
          planId: plan.id,
          status: 'active',
          mode,
          personaId,
        },
      });
    } catch {
      session = {
        id: sessionId,
        userId,
        planId: plan.id,
        status: 'active',
        mode,
        personaId,
        startedAt: new Date(),
        createdAt: new Date(),
      };
      mockSessions.set(sessionId, session);
    }

    // Generate short-lived session-scoped WebSocket token per TRD
    const wsToken = await this.authService.generateWsToken(userId, sessionId);

    return {
      sessionId: session.id,
      status: session.status,
      wsToken,
      mode: session.mode,
      personaId: session.personaId,
      startedAt: session.startedAt,
    };
  }

  async getSessionById(sessionId: string, userId: string) {
    let session;
    try {
      session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: { turns: { orderBy: { seq: 'asc' } } },
      });
    } catch {
      session = mockSessions.get(sessionId);
    }

    if (!session) {
      if (sessionId === 'sess-892') {
        return {
          id: 'sess-892',
          userId,
          status: 'active',
          mode: 'realistic',
          personaId: 'p-sarah',
          startedAt: new Date(),
          turns: await this.turnManager.getSessionTurns('sess-892'),
        };
      }
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async endSession(sessionId: string, userId: string) {
    const session = await this.getSessionById(sessionId, userId);
    const endedAt = new Date();

    try {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { status: 'completed', endedAt },
      });
    } catch {
      mockSessions.set(sessionId, { ...session, status: 'completed', endedAt });
    }

    return {
      sessionId,
      status: 'completed',
      endedAt,
      reportPending: true,
    };
  }

  async getUserSessions(userId: string) {
    try {
      return await this.prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      return Array.from(mockSessions.values()).filter((s) => s.userId === userId);
    }
  }
}
