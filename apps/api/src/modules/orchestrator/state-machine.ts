export type RoundName =
  | 'warmup'
  | 'behavioral'
  | 'technical'
  | 'coding'
  | 'candidate_questions'
  | 'closing'
  | 'ended';

export type FollowUpIntensity = 'gentle' | 'moderate' | 'rigorous' | 'relentless';

export interface RoundBudget {
  name: RoundName;
  questionCount: number;
  durationMinutes: number;
}

export interface StateMachineContext {
  sessionId: string;
  currentRound: RoundName;
  questionIndex: number;
  totalQuestions: number;
  timeRemainingSeconds: number;
  isPaused: boolean;
  questionsAskedInRound: number;
  followUpsAsked: number;
  openingDelivered: boolean;
}

export type TurnDecision =
  | { type: 'follow_up'; round: RoundName }
  | { type: 'next_question'; round: RoundName }
  | { type: 'next_round'; round: RoundName; previousRound: RoundName }
  | { type: 'complete'; round: 'ended' };

export const LIVE_ROUND_ORDER: RoundName[] = [
  'warmup',
  'behavioral',
  'technical',
  'coding',
  'candidate_questions',
  'closing',
];

export const DEFAULT_ROUND_BUDGETS: RoundBudget[] = [
  { name: 'warmup', questionCount: 1, durationMinutes: 5 },
  { name: 'behavioral', questionCount: 2, durationMinutes: 10 },
  { name: 'technical', questionCount: 2, durationMinutes: 15 },
  { name: 'coding', questionCount: 1, durationMinutes: 10 },
  { name: 'candidate_questions', questionCount: 1, durationMinutes: 5 },
  { name: 'closing', questionCount: 1, durationMinutes: 2 },
];

const MAX_FOLLOW_UPS: Record<FollowUpIntensity, number> = {
  gentle: 1,
  moderate: 2,
  rigorous: 3,
  relentless: 4,
};

export class InterviewStateMachine {
  private ctx: StateMachineContext;
  private budgets: RoundBudget[];
  private followUpIntensity: FollowUpIntensity;

  constructor(
    sessionId: string,
    totalQuestions = 7,
    durationMinutes = 45,
    budgets: RoundBudget[] = DEFAULT_ROUND_BUDGETS,
    followUpIntensity: FollowUpIntensity = 'moderate'
  ) {
    this.budgets = budgets.length ? budgets : DEFAULT_ROUND_BUDGETS;
    this.followUpIntensity = followUpIntensity;
    this.ctx = {
      sessionId,
      currentRound: 'warmup',
      questionIndex: 1,
      totalQuestions,
      timeRemainingSeconds: durationMinutes * 60,
      isPaused: false,
      questionsAskedInRound: 1,
      followUpsAsked: 0,
      openingDelivered: false,
    };
  }

  markOpeningDelivered() {
    this.ctx.openingDelivered = true;
  }

  getContext(): Readonly<StateMachineContext> {
    return { ...this.ctx };
  }

  getCurrentBudget(): RoundBudget | undefined {
    return this.budgets.find((b) => b.name === this.ctx.currentRound);
  }

  /**
   * Decide whether to stay on a follow-up, ask the next question in-round,
   * change round, or end. Does not advance on every candidate utterance.
   */
  decideNextTurn(opts?: { forceAdvance?: boolean }): TurnDecision {
    if (this.ctx.currentRound === 'ended') {
      return { type: 'complete', round: 'ended' };
    }

    const budget = this.getCurrentBudget();
    const maxFollowUps = MAX_FOLLOW_UPS[this.followUpIntensity];
    const questionCap = budget?.questionCount ?? 1;
    const previousRound = this.ctx.currentRound;
    const timeUp = this.ctx.timeRemainingSeconds <= 0;
    const force = Boolean(opts?.forceAdvance);

    const canFollowUp =
      !force &&
      !timeUp &&
      previousRound !== 'closing' &&
      this.ctx.followUpsAsked < maxFollowUps;

    if (canFollowUp) {
      this.ctx.followUpsAsked += 1;
      return { type: 'follow_up', round: previousRound };
    }

    const canAskAnotherQuestion =
      !force &&
      !timeUp &&
      previousRound !== 'closing' &&
      this.ctx.questionsAskedInRound < questionCap;

    if (canAskAnotherQuestion) {
      this.ctx.questionsAskedInRound += 1;
      this.ctx.questionIndex += 1;
      this.ctx.followUpsAsked = 0;
      return { type: 'next_question', round: previousRound };
    }

    const currentIndex = LIVE_ROUND_ORDER.indexOf(previousRound);
    const nextRound = LIVE_ROUND_ORDER[currentIndex + 1];

    if (!nextRound) {
      this.ctx.currentRound = 'ended';
      return { type: 'complete', round: 'ended' };
    }

    this.ctx.currentRound = nextRound;
    this.ctx.questionsAskedInRound = 1;
    this.ctx.followUpsAsked = 0;
    this.ctx.questionIndex += 1;
    return { type: 'next_round', round: nextRound, previousRound };
  }

  /** @deprecated Use decideNextTurn — kept for older call sites */
  nextTurn(): { roundChanged: boolean; newRound: RoundName; isCompleted: boolean } {
    const decision = this.decideNextTurn({ forceAdvance: true });
    if (decision.type === 'complete') {
      return { roundChanged: true, newRound: 'ended', isCompleted: true };
    }
    if (decision.type === 'next_round') {
      return { roundChanged: true, newRound: decision.round, isCompleted: false };
    }
    return { roundChanged: false, newRound: decision.round, isCompleted: false };
  }

  pause() {
    this.ctx.isPaused = true;
  }

  pauseTimer() {
    this.ctx.isPaused = true;
  }

  resume() {
    this.ctx.isPaused = false;
  }

  resumeTimer() {
    this.ctx.isPaused = false;
  }

  tick(seconds = 1) {
    if (!this.ctx.isPaused) {
      this.ctx.timeRemainingSeconds = Math.max(0, this.ctx.timeRemainingSeconds - seconds);
    }
  }

  endSession() {
    this.ctx.currentRound = 'ended';
  }
}
