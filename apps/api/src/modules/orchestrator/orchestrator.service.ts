import { Injectable, Logger } from '@nestjs/common';
import { InterviewStateMachine } from './state-machine';
import { TurnManager } from './turn-manager';
import { PERSONA_PRESETS } from './prompts/personas';
import { buildInterviewerPrompt } from './prompts/interviewer.prompt';

const activeStateMachines = new Map<string, InterviewStateMachine>();

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(private readonly turnManager: TurnManager) {}

  getOrCreateStateMachine(sessionId: string, totalQuestions = 7, durationMinutes = 45): InterviewStateMachine {
    if (!activeStateMachines.has(sessionId)) {
      activeStateMachines.set(sessionId, new InterviewStateMachine(sessionId, totalQuestions, durationMinutes));
    }
    return activeStateMachines.get(sessionId)!;
  }

  async processCandidateMessage(sessionId: string, text: string, personaId = 'p-sarah', round = 'behavioral') {
    const persona = PERSONA_PRESETS[personaId] || PERSONA_PRESETS['p-sarah'];
    const sm = this.getOrCreateStateMachine(sessionId);
    const state = sm.getContext();

    // 1. Record candidate turn
    const startMs = Date.now();
    await this.turnManager.recordTurn({
      sessionId,
      round: state.currentRound,
      speaker: 'candidate',
      text,
      startMs: 0,
      endMs: 3000,
    });

    // 2. Advance state machine
    const transition = sm.nextTurn();

    // 3. Build interviewer prompt context & generate text response
    const prompt = buildInterviewerPrompt({
      persona,
      jobTitle: 'Senior Frontend Engineer',
      company: 'TechCorp',
      currentRound: transition.newRound,
      roundGoal: `Assess candidate depth in ${transition.newRound}`,
      mode: 'realistic',
      parsedSkillsSummary: 'React, Next.js, STAR behavioral, TypeScript',
      timeRemainingMinutes: Math.floor(state.timeRemainingSeconds / 60),
    });

    this.logger.log(`Session ${sessionId} turn prompt context generated for persona ${persona.name}`);

    // Text response fixture (can be replaced by real Claude LLM provider)
    let interviewerText = `Thank you for sharing that context. Can you describe a specific technical challenge you faced when scaling React component state?`;

    if (transition.newRound === 'coding') {
      interviewerText = `Let's switch to our coding lab. Please implement an array debounce function in the terminal editor.`;
    } else if (transition.newRound === 'closing') {
      interviewerText = `We've covered all our technical areas today. Do you have any questions for me about the team or role?`;
    } else if (transition.isCompleted) {
      interviewerText = `That wraps up our mock interview session today! Generating your performance report now.`;
    }

    // 4. Record interviewer turn
    const interviewerTurn = await this.turnManager.recordTurn({
      sessionId,
      round: transition.newRound,
      speaker: 'interviewer',
      text: interviewerText,
      startMs: 3500,
      endMs: 7000,
    });

    return {
      interviewerText,
      turnId: interviewerTurn.id,
      state: {
        round: transition.newRound,
        timeRemaining: state.timeRemainingSeconds,
        questionIndex: state.questionIndex,
        total: state.totalQuestions,
        mode: 'realistic',
        personaId,
        isCompleted: transition.isCompleted,
      },
    };
  }
}
