import { Injectable, Inject, Logger } from '@nestjs/common';
import { InterviewStateMachine } from './state-machine';
import { TurnManager } from './turn-manager';
import { PERSONA_PRESETS } from './prompts/personas';
import { buildInterviewerPrompt, INTERVIEWER_PROMPT_VERSION } from './prompts/interviewer.prompt';
import { LlmProvider } from '../ai/interfaces/llm.provider';
import { TtsProvider } from '../ai/interfaces/tts.provider';
import { SentenceSplitter } from '../ai/sentence-splitter';

const activeStateMachines = new Map<string, InterviewStateMachine>();

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

  async processCandidateMessage(
    sessionId: string,
    text: string,
    personaId = 'p-sarah',
    round?: string,
    onTokenChunk?: (chunk: string) => void,
    onAudioChunk?: (chunk: Buffer) => void
  ) {
    this.logger.log(`[TurnLoop Step 1] Received candidate final transcript for session ${sessionId}: "${text}"`);

    const persona = PERSONA_PRESETS[personaId] || PERSONA_PRESETS['p-sarah'];
    const sm = this.getOrCreateStateMachine(sessionId);
    const state = sm.getContext();

    // 1. Record candidate turn
    await this.turnManager.recordTurn({
      sessionId,
      round: state.currentRound,
      speaker: 'candidate',
      text,
      startMs: Date.now() - 3000,
      endMs: Date.now(),
    });

    // 2. Advance state machine
    const transition = sm.nextTurn();

    // 3. Build interviewer prompt context
    const systemPrompt = buildInterviewerPrompt({
      persona,
      jobTitle: 'Senior Frontend Engineer',
      company: 'TechCorp',
      currentRound: transition.newRound,
      roundGoal: `Assess candidate depth in ${transition.newRound}`,
      mode: 'realistic',
      parsedSkillsSummary: 'React, Next.js, STAR behavioral, TypeScript',
      timeRemainingMinutes: Math.floor(state.timeRemainingSeconds / 60),
    });

    this.logger.log(
      `[TurnLoop Step 2] Built system prompt for session ${sessionId}, round: ${transition.newRound}, persona: ${persona.name}`
    );

    let interviewerText = '';
    const sentenceSplitter = new SentenceSplitter();

    const handleSentence = async (sentence: string) => {
      this.logger.log(
        `[TurnLoop Step 4] Sentence boundary detected: "${sentence}" -> Invoking TTS synthesis (${persona.voiceName || personaId})`
      );
      try {
        await this.ttsProvider.synthesizeSpeech({
          text: sentence,
          voiceId: persona.voiceName || personaId,
          onAudioChunk: (audioBuf) => {
            this.logger.log(
              `[TurnLoop Step 5] TTS generated audio chunk of ${audioBuf.length} bytes -> forwarding to WS client`
            );
            if (onAudioChunk) {
              onAudioChunk(audioBuf);
            }
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
        userPrompt: `Candidate said: "${text}". Respond as the interviewer.`,
        temperature: 0.3,
        maxTokens: 300,
        onChunk: (delta) => {
          if (onTokenChunk) onTokenChunk(delta);
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
        `[TurnLoop Step 3 Fallback] LLM provider call failed for session ${sessionId}: ${llmErr.message}. Using fallback interviewer turn.`
      );

      interviewerText = `Thank you for sharing that context. Can you describe a specific technical challenge you faced when scaling React component state?`;

      if (transition.newRound === 'coding') {
        interviewerText = `Let's switch to our coding lab. Please implement an array debounce function in the terminal editor.`;
      } else if (transition.newRound === 'closing') {
        interviewerText = `We've covered all our technical areas today. Do you have any questions for me about the team or role?`;
      } else if (transition.isCompleted) {
        interviewerText = `That wraps up our mock interview session today! Generating your performance report now.`;
      }

      await handleSentence(interviewerText);
    }

    // 4. Record interviewer turn
    const interviewerTurn = await this.turnManager.recordTurn({
      sessionId,
      round: transition.newRound,
      speaker: 'interviewer',
      text: interviewerText,
      startMs: Date.now(),
      endMs: Date.now() + 4000,
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
