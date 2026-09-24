export type RoundName = 'warmup' | 'behavioral' | 'technical' | 'coding' | 'closing' | 'ended';

export interface StateMachineContext {
  sessionId: string;
  currentRound: RoundName;
  questionIndex: number;
  totalQuestions: number;
  timeRemainingSeconds: number;
  isPaused: boolean;
}

export const ROUND_ORDER: RoundName[] = ['warmup', 'behavioral', 'technical', 'coding', 'closing', 'ended'];

export class InterviewStateMachine {
  private ctx: StateMachineContext;

  constructor(sessionId: string, totalQuestions = 7, durationMinutes = 45) {
    this.ctx = {
      sessionId,
      currentRound: 'warmup',
      questionIndex: 1,
      totalQuestions,
      timeRemainingSeconds: durationMinutes * 60,
      isPaused: false,
    };
  }

  getContext(): Readonly<StateMachineContext> {
    return { ...this.ctx };
  }

  nextTurn(): { roundChanged: boolean; newRound: RoundName; isCompleted: boolean } {
    if (this.ctx.currentRound === 'ended') {
      return { roundChanged: false, newRound: 'ended', isCompleted: true };
    }

    this.ctx.questionIndex += 1;
    const currentIndex = ROUND_ORDER.indexOf(this.ctx.currentRound);

    // Transition round every 1-2 questions
    if (this.ctx.questionIndex > 1 && this.ctx.questionIndex <= 2 && currentIndex === 0) {
      this.ctx.currentRound = 'behavioral';
      return { roundChanged: true, newRound: 'behavioral', isCompleted: false };
    } else if (this.ctx.questionIndex > 2 && this.ctx.questionIndex <= 4 && currentIndex === 1) {
      this.ctx.currentRound = 'technical';
      return { roundChanged: true, newRound: 'technical', isCompleted: false };
    } else if (this.ctx.questionIndex > 4 && this.ctx.questionIndex <= 5 && currentIndex === 2) {
      this.ctx.currentRound = 'coding';
      return { roundChanged: true, newRound: 'coding', isCompleted: false };
    } else if (this.ctx.questionIndex > 5 && this.ctx.questionIndex <= 6 && currentIndex === 3) {
      this.ctx.currentRound = 'closing';
      return { roundChanged: true, newRound: 'closing', isCompleted: false };
    } else if (this.ctx.questionIndex > 6) {
      this.ctx.currentRound = 'ended';
      return { roundChanged: true, newRound: 'ended', isCompleted: true };
    }

    return { roundChanged: false, newRound: this.ctx.currentRound, isCompleted: false };
  }

  pause() {
    this.ctx.isPaused = true;
  }

  resume() {
    this.ctx.isPaused = false;
  }

  endSession() {
    this.ctx.currentRound = 'ended';
  }
}
