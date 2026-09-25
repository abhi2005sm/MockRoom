import { Injectable, Inject, NotFoundException, Logger, Optional } from '@nestjs/common';
import { PracticeScoringService } from './practice-scoring.service';
import { buildCoachingRewritePrompt, COACHING_REWRITE_PROMPT_VERSION } from './prompts/coaching-rewrite.prompt';
import { PrismaService } from '../../database/prisma.service';
import { LlmProvider } from '../ai/interfaces/llm.provider';

const mockCoachingSections = new Map<string, any>();

@Injectable()
export class CoachingService {
  private readonly logger = new Logger(CoachingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly practiceScoring: PracticeScoringService,
    @Optional() @Inject('LLM_PROVIDER') private readonly llmProvider?: LlmProvider
  ) {
    this.seedDefaultMockSections();
  }

  private seedDefaultMockSections() {
    const defaultSections = [
      {
        id: 'coach-1',
        sessionId: 'sess-892',
        questionId: 'q-1',
        sectionType: 'intro',
        questionText: 'Tell me about yourself and your background as a Senior Frontend Engineer.',
        originalText: 'Um, so basically I have been doing frontend for like 5 years. Mostly React and CSS, and I worked on a big app at my last job where we fixed some state lag.',
        issues: [
          'Frequent vocal filler words ("um", "so basically", "like")',
          'Buried the impact of the state lag resolution without metrics',
        ],
        rewrittenText: 'I’m a Senior Frontend Engineer with 5 years of experience building high-performance web applications in React and TypeScript. At my previous role, I led the refactoring of our core state store, reducing component re-renders by 40% and eliminating UI latency under peak traffic.',
        reasoning: [
          'Leads immediately with seniority, total years, and tech stack',
          'Quantifies state performance improvement with clear metrics (40% reduction)',
          'Replaces filler words with confident active verbs',
        ],
        tipIds: ['tip-star-1', 'tip-metrics-2'],
        practiced: false,
        createdAt: new Date(),
      },
      {
        id: 'coach-2',
        sessionId: 'sess-892',
        questionId: 'q-2',
        sectionType: 'behavioral',
        questionText: 'Describe a time you resolved a major production outage under time pressure.',
        originalText: 'We had a bug where the API dropped WebSocket connections. I stayed up late and fixed the reconnect logic.',
        issues: [
          'Lacks formal STAR (Situation, Task, Action, Result) narrative structure',
          'Omitted team coordination and root-cause analysis details',
        ],
        rewrittenText: 'When an unexpected spike caused WebSocket connection drops during a major release, I spearheaded the root-cause diagnosis. I implemented an exponential backoff reconnect algorithm and added automated heartbeat checks, restoring system stability within 20 minutes.',
        reasoning: [
          'Establishes immediate STAR context and urgency',
          'Details exact technical solution (exponential backoff & heartbeats)',
          'States clear resolution timeframe (20 minutes)',
        ],
        tipIds: ['tip-star-3'],
        practiced: true,
        createdAt: new Date(),
      },
    ];

    defaultSections.forEach((sec) => mockCoachingSections.set(sec.id, sec));
  }

  async generateCoachingSections(sessionId: string) {
    this.logger.log(`Generating coaching sections for session ${sessionId} using Prompt ${COACHING_REWRITE_PROMPT_VERSION}`);

    if (this.llmProvider) {
      try {
        const prompt = buildCoachingRewritePrompt({
          jobTitle: 'Senior Frontend Engineer',
          sectionType: 'technical',
          questionText: 'Can you describe a specific technical challenge you faced when scaling React component state?',
          originalText: 'In my previous project, we refactored our component state to prevent unnecessary re-renders...',
        });

        const res = await this.llmProvider.generateStructuredJson<any>(
          {
            systemPrompt: prompt,
            userPrompt: 'Rewrite candidate answer into high-impact STAR response.',
            temperature: 0.1,
            promptVersion: COACHING_REWRITE_PROMPT_VERSION,
          },
          'coaching-rewrite'
        );

        if (res && res.sections && res.sections.length > 0) {
          return res.sections;
        }
      } catch (err: any) {
        this.logger.warn(`LLM coaching rewrite generation failed: ${err.message}. Using default sections.`);
      }
    }

    return Array.from(mockCoachingSections.values());
  }

  async getCoachingSections(sessionId?: string, sectionType?: string, practiced?: boolean) {
    try {
      let whereClause: any = {};
      if (sessionId) whereClause.sessionId = sessionId;
      if (sectionType) whereClause.sectionType = sectionType;
      if (practiced !== undefined) whereClause.practiced = practiced;

      const items = await this.prisma.coachingSection.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });
      if (items.length > 0) return items;
    } catch {}

    let items = Array.from(mockCoachingSections.values());
    if (sessionId) items = items.filter((s) => s.sessionId === sessionId);
    if (sectionType) items = items.filter((s) => s.sectionType === sectionType);
    if (practiced !== undefined) items = items.filter((s) => s.practiced === practiced);
    return items;
  }

  async getCoachingSectionById(id: string) {
    try {
      const sec = await this.prisma.coachingSection.findUnique({ where: { id } });
      if (sec) return sec;
    } catch {}

    const mock = mockCoachingSections.get(id);
    if (!mock) throw new NotFoundException('Coaching card not found');
    return mock;
  }

  async submitPracticeAttempt(id: string, attemptText: string, attemptAudioUrl?: string) {
    const section = await this.getCoachingSectionById(id);
    const scoreResult = this.practiceScoring.scoreAttempt(
      section.originalText,
      section.rewrittenText,
      attemptText
    );

    const attemptId = `att_${Date.now()}`;
    const attempt = {
      id: attemptId,
      coachingSectionId: id,
      attemptText,
      attemptAudioUrl: attemptAudioUrl || null,
      score: scoreResult.score,
      comparedToOriginalDelta: scoreResult.comparedToOriginalDelta,
      feedback: scoreResult.feedback,
      createdAt: new Date(),
    };

    section.practiced = true;
    try {
      await this.prisma.coachingSection.update({
        where: { id },
        data: { practiced: true },
      });
      await this.prisma.coachingPracticeAttempt.create({
        data: {
          id: attemptId,
          coachingSectionId: id,
          attemptText,
          attemptAudioUrl: attemptAudioUrl || null,
          score: scoreResult.score,
          comparedToOriginalDelta: scoreResult.comparedToOriginalDelta,
        },
      });
    } catch {
      mockCoachingSections.set(id, section);
    }

    return attempt;
  }

  async getCoachingTrends() {
    return [
      { category: 'Filler Words', count: 4, label: 'High filler usage ("um", "like") during technical deep-dives' },
      { category: 'Metrics Missing', count: 3, label: 'Unquantified project results in STAR behavioral answers' },
      { category: 'Hedging', count: 2, label: 'Use of non-committal phrases ("I think maybe")' },
    ];
  }
}
