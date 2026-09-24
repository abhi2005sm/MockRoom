import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeakAreas(userId: string) {
    return [
      {
        id: 'wa-1',
        category: 'STAR Behavioral Structure',
        title: 'Lacks Quantifiable Metrics in STAR Stories',
        frequencyCount: 3,
        lastOccurredDate: '22 Sep 2026',
        impactScore: 8.5,
        recommendation: 'Always state explicit metrics (e.g. % performance increase, latency drop, or timeline) in your Action and Result steps.',
      },
      {
        id: 'wa-2',
        category: 'Speech Delivery & Delivery Cadence',
        title: 'Filler Word Frequency under Technical Pressure',
        frequencyCount: 2,
        lastOccurredDate: '20 Sep 2026',
        impactScore: 7.2,
        recommendation: 'Pace your technical explanations by pausing for 1 second instead of filling silence with "um" or "like".',
      },
    ];
  }

  async getRetryQueue(userId: string) {
    return [
      {
        id: 'retry-1',
        questionText: 'Can you describe a specific technical challenge you faced when scaling React component state?',
        jobTitle: 'Senior Frontend Engineer',
        previousScore: 68,
        round: 'technical',
        dateAsked: '22 Sep 2026',
      },
      {
        id: 'retry-2',
        questionText: 'Describe a time you resolved a major production outage under time pressure.',
        jobTitle: 'Senior Frontend Engineer',
        previousScore: 62,
        round: 'behavioral',
        dateAsked: '20 Sep 2026',
      },
    ];
  }

  async searchAnswerLibrary(userId: string, query: string) {
    const defaultAnswers = [
      {
        id: 'ans-1',
        questionText: 'Can you describe a specific technical challenge you faced when scaling React component state?',
        category: 'Technical',
        answerText: 'In my previous role, we refactored our global state store to eliminate component re-renders during high-frequency WebSocket updates. By separating local state and implementing custom selector hooks, we reduced render latency by 40%.',
        score: 84,
        jobTitle: 'Senior Frontend Engineer',
        date: '22 Sep 2026',
        tags: ['React', 'WebSockets', 'State Management'],
      },
      {
        id: 'ans-2',
        questionText: 'Describe a time you resolved a major production outage under time pressure.',
        category: 'Behavioral',
        answerText: 'When our primary API gateway suffered connection drops during a product launch, I led the emergency response. I implemented exponential backoff reconnection algorithms and added health-check heartbeats, restoring full uptime in 20 minutes.',
        score: 88,
        jobTitle: 'Senior Frontend Engineer',
        date: '20 Sep 2026',
        tags: ['Outage Resolution', 'STAR', 'Leadership'],
      },
    ];

    if (!query) return defaultAnswers;

    const q = query.toLowerCase();
    return defaultAnswers.filter(
      (a) =>
        a.questionText.toLowerCase().includes(q) ||
        a.answerText.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  async getProgressTrends(userId: string) {
    return {
      scoreHistory: [
        { session: 'Session 1', score: 68, date: '10 Sep 2026' },
        { session: 'Session 2', score: 72, date: '14 Sep 2026' },
        { session: 'Session 3', score: 76, date: '18 Sep 2026' },
        { session: 'Session 4', score: 82, date: '22 Sep 2026' },
      ],
      improvementPct: 20.5,
    };
  }
}
