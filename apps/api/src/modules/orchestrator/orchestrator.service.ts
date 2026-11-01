import { Injectable, Inject, Logger } from '@nestjs/common';
import { InterviewStateMachine, RoundName } from './state-machine';
import { TurnManager } from './turn-manager';
import { PERSONA_PRESETS, PersonaPreset } from './prompts/personas';
import {
  buildInterviewerPrompt,
  INTERVIEWER_PROMPT_VERSION,
  ROUND_GOALS,
} from './prompts/interviewer.prompt';
import { LlmProvider } from '../ai/interfaces/llm.provider';
import { TtsProvider } from '../ai/interfaces/tts.provider';
import { SentenceSplitter } from '../ai/sentence-splitter';
import { MODE_CONFIGS, InterviewMode } from '../plans/mode-configs';

const activeStateMachines = new Map<string, InterviewStateMachine>();

const PERSONA_ALIASES: Record<string, string> = {
  'maya-engineering-mgr': 'p-elena',
  'marcus-strict-interviewer': 'p-marcus',
  'sarah-product-lead': 'p-sarah',
};

const ACK_FILLERS = ['Mm-hm.', 'Okay.', 'Got it.'];

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    private readonly turnManager: TurnManager,
    @Inject('LLM_PROVIDER') private readonly llmProvider: LlmProvider,
    @Inject('TTS_PROVIDER') private readonly ttsProvider: TtsProvider
  ) {}

  getOrCreateStateMachine(
    sessionId: string,
    totalQuestions = 7,
    durationMinutes = 45
  ): InterviewStateMachine {
    if (!activeStateMachines.has(sessionId)) {
      activeStateMachines.set(
        sessionId,
        new InterviewStateMachine(sessionId, totalQuestions, durationMinutes)
      );
    }
    return activeStateMachines.get(sessionId)!;
  }

  resolvePersona(personaId?: string): PersonaPreset {
    const id = personaId || 'alex-tech-lead';
    return PERSONA_PRESETS[id] || PERSONA_PRESETS[PERSONA_ALIASES[id]] || PERSONA_PRESETS['alex-tech-lead'] || PERSONA_PRESETS['p-sarah'];
  }

  async speakAckFiller(
    personaId: string,
    onAudioChunk?: (chunk: Buffer) => void
  ): Promise<string> {
    const persona = this.resolvePersona(personaId);
    const filler = ACK_FILLERS[Math.floor(Math.random() * ACK_FILLERS.length)];
    try {
      await this.ttsProvider.synthesizeSpeech({
        text: filler,
        voiceId: persona.voiceName || persona.id,
        onAudioChunk: (audioBuf) => onAudioChunk?.(audioBuf),
      });
    } catch (err: any) {
      this.logger.warn(`[TurnLoop] Ack filler TTS failed: ${err.message}`);
    }
    return filler;
  }

  async startOpeningTurn(
    sessionId: string,
    personaId = 'alex-tech-lead',
    onTokenChunk?: (chunk: string) => void,
    onAudioChunk?: (chunk: Buffer) => void,
    jobTitle = 'Senior Frontend Engineer',
    company = 'Stripe'
  ) {
    const sm = this.getOrCreateStateMachine(sessionId);
    if (sm.getContext().openingDelivered) {
      return null;
    }
    sm.markOpeningDelivered();

    return this.generateInterviewerTurn({
      sessionId,
      personaId,
      candidateText: 'The candidate just joined the call. Begin the interview.',
      turnAction: 'open',
      activeRound: 'warmup',
      onTokenChunk,
      onAudioChunk,
      jobTitle,
      company,
    });
  }

  async processCandidateMessage(
    sessionId: string,
    text: string,
    personaId = 'alex-tech-lead',
    round?: string,
    onTokenChunk?: (chunk: string) => void,
    onAudioChunk?: (chunk: Buffer) => void
  ) {
    this.logger.log(`[TurnLoop Step 1] Received candidate final transcript for session ${sessionId}: "${text}"`);

    const sm = this.getOrCreateStateMachine(sessionId);
    const state = sm.getContext();

    await this.turnManager.recordTurn({
      sessionId,
      round: state.currentRound,
      speaker: 'candidate',
      text,
      startMs: Date.now() - 3000,
      endMs: Date.now(),
    });

    const decision = sm.decideNextTurn();
    const activeRound = decision.round;

    return this.generateInterviewerTurn({
      sessionId,
      personaId,
      candidateText: text,
      turnAction: decision.type,
      activeRound,
      onTokenChunk,
      onAudioChunk,
      isCompleted: decision.type === 'complete',
    });
  }

  private async generateInterviewerTurn(opts: {
    sessionId: string;
    personaId: string;
    candidateText: string;
    turnAction: 'follow_up' | 'next_question' | 'next_round' | 'complete' | 'open';
    activeRound: RoundName | 'ended';
    onTokenChunk?: (chunk: string) => void;
    onAudioChunk?: (chunk: Buffer) => void;
    jobTitle?: string;
    company?: string;
    isCompleted?: boolean;
  }) {
    const persona = this.resolvePersona(opts.personaId);
    const sm = this.getOrCreateStateMachine(opts.sessionId);
    const state = sm.getContext();
    const modeId: InterviewMode = 'realistic';
    const modeConfig = MODE_CONFIGS[modeId];
    const activeRound = opts.activeRound === 'ended' ? 'closing' : opts.activeRound;
    const roundGoal = ROUND_GOALS[activeRound] || ROUND_GOALS.technical;

    const systemPrompt = buildInterviewerPrompt({
      persona,
      jobTitle: opts.jobTitle || 'Senior Frontend Engineer',
      company: opts.company || 'Stripe',
      currentRound: activeRound,
      roundGoal,
      mode: modeId,
      parsedSkillsSummary: 'React, Next.js, STAR behavioral, TypeScript',
      timeRemainingMinutes: Math.floor(state.timeRemainingSeconds / 60),
      hintsAllowed: modeConfig.hintsAllowed,
      followUpIntensity: modeConfig.followUpIntensity,
      thinkTimeSeconds: modeConfig.thinkTimeSeconds,
      turnAction: opts.turnAction,
    });

    this.logger.log(
      `[TurnLoop Step 2] Built system prompt for session ${opts.sessionId}, round: ${activeRound}, action: ${opts.turnAction}, persona: ${persona.name}`
    );

    let interviewerText = '';
    const sentenceSplitter = new SentenceSplitter();

    const handleSentence = async (sentence: string) => {
      this.logger.log(
        `[TurnLoop Step 4] Sentence boundary detected: "${sentence}" -> Invoking TTS synthesis (${persona.voiceName || persona.id})`
      );
      try {
        await this.ttsProvider.synthesizeSpeech({
          text: sentence,
          voiceId: persona.voiceName || persona.id,
          onAudioChunk: (audioBuf) => {
            this.logger.log(
              `[TurnLoop Step 5] TTS generated audio chunk of ${audioBuf.length} bytes -> forwarding to WS client`
            );
            opts.onAudioChunk?.(audioBuf);
          },
        });
      } catch (ttsErr: any) {
        this.logger.warn(`[TurnLoop Step 5 Warning] Sentence TTS failed: ${ttsErr.message}`);
      }
    };

    try {
      this.logger.log(`[TurnLoop Step 3] Calling LLM generateCompletion with streaming tokens...`);

      interviewerText = await this.llmProvider.generateCompletion({
        systemPrompt,
        userPrompt:
          opts.turnAction === 'open'
            ? opts.candidateText
            : `Candidate said: "${opts.candidateText}". Respond as the interviewer for this turn only.`,
        temperature: 0.3,
        maxTokens: 300,
        onChunk: (delta) => {
          opts.onTokenChunk?.(delta);
          sentenceSplitter.push(delta, (sentence) => {
            handleSentence(sentence).catch((e) =>
              this.logger.error(`Error in sentence TTS: ${e.message}`)
            );
          });
        },
        promptVersion: INTERVIEWER_PROMPT_VERSION,
      });

      sentenceSplitter.flush((sentence) => {
        handleSentence(sentence).catch((e) =>
          this.logger.error(`Error in final sentence TTS: ${e.message}`)
        );
      });
    } catch (llmErr: any) {
      this.logger.warn(
        `[TurnLoop Step 3 Fallback] LLM provider call failed for session ${opts.sessionId}: ${llmErr.message}. Using fallback interviewer turn.`
      );

      interviewerText = this.fallbackLine(opts.turnAction, activeRound);
      await handleSentence(interviewerText);
    }

    const interviewerTurn = await this.turnManager.recordTurn({
      sessionId: opts.sessionId,
      round: activeRound,
      speaker: 'interviewer',
      text: interviewerText,
      startMs: Date.now(),
      endMs: Date.now() + 4000,
    });

    return {
      interviewerText,
      turnId: interviewerTurn.id,
      state: {
        round: activeRound,
        timeRemaining: state.timeRemainingSeconds,
        questionIndex: state.questionIndex,
        total: state.totalQuestions,
        mode: modeId,
        personaId: persona.id,
        isCompleted: Boolean(opts.isCompleted),
      },
    };
  }

  private fallbackLine(
    turnAction: 'follow_up' | 'next_question' | 'next_round' | 'complete' | 'open',
    round: string
  ): string {
    if (turnAction === 'open') {
      return "Hi, I'm Alex Rivera, staff engineer on the frontend platform team. We'll start with your background, then some technical discussion, a short coding exercise, and time for your questions. To begin, could you walk me through your background and what draws you to this role?";
    }
    if (turnAction === 'follow_up') {
      return 'Thanks, that helps. Can you walk me through a specific example, including what you did and how it turned out?';
    }
    if (turnAction === 'next_round' && round === 'coding') {
      return "Let's shift to a short coding exercise. Please implement a reusable debounce helper and run it when you are ready.";
    }
    if (turnAction === 'next_round' && round === 'candidate_questions') {
      return 'I want to leave time for you. What questions do you have for me about the team or the role?';
    }
    if (turnAction === 'next_round' && round === 'closing') {
      return "Thanks for those questions. That's all I had for today. We'll follow up with next steps.";
    }
    if (turnAction === 'complete') {
      return "Thanks again for your time today. We'll be in touch.";
    }
    return 'Got it. Let me ask you about a related situation. What would you do differently if you had to do that again?';
  }
}
