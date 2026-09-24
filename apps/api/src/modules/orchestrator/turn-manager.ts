import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface TurnData {
  sessionId: string;
  round: string;
  speaker: 'interviewer' | 'candidate';
  text: string;
  startMs: number;
  endMs: number;
  questionId?: string;
}

const mockTurns = new Map<string, any[]>();

@Injectable()
export class TurnManager {
  constructor(private readonly prisma: PrismaService) {}

  async recordTurn(data: TurnData) {
    let seq = 1;
    try {
      const count = await this.prisma.turn.count({ where: { sessionId: data.sessionId } });
      seq = count + 1;

      const turn = await this.prisma.turn.create({
        data: {
          sessionId: data.sessionId,
          round: data.round,
          seq,
          speaker: data.speaker,
          text: data.text,
          startMs: data.startMs,
          endMs: data.endMs,
          questionId: data.questionId,
        },
      });
      return turn;
    } catch {
      const existing = mockTurns.get(data.sessionId) || [];
      seq = existing.length + 1;
      const turn = {
        id: `turn_${Date.now()}_${seq}`,
        sessionId: data.sessionId,
        round: data.round,
        seq,
        speaker: data.speaker,
        text: data.text,
        startMs: data.startMs,
        endMs: data.endMs,
        questionId: data.questionId,
        createdAt: new Date(),
      };
      existing.push(turn);
      mockTurns.set(data.sessionId, existing);
      return turn;
    }
  }

  async getSessionTurns(sessionId: string) {
    try {
      return await this.prisma.turn.findMany({
        where: { sessionId },
        orderBy: { seq: 'asc' },
      });
    } catch {
      return mockTurns.get(sessionId) || [];
    }
  }
}
