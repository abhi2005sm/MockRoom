import { create } from 'zustand';
import {
  AnswerLibraryItem,
  CoachingSection,
  EvaluationReport,
  InterviewPlan,
  JobAnalysis,
  Persona,
  PracticeAttempt,
  QuestionScore,
  RetryQuestion,
  Turn,
  WeakAreaItem,
} from '../lib/shared/types';
import { INTERVIEW_MODES, PERSONAS } from '../lib/shared/constants';
import {
  ANSWER_LIBRARY_DATA,
  INITIAL_COACHING_SECTIONS,
  INITIAL_JOB_ANALYSIS,
  INITIAL_PRACTICE_ATTEMPTS,
  INITIAL_PLAN,
  RECENT_EVALUATION_REPORT,
  RETRY_MISTAKES_DATA,
  WEAK_AREAS_DATA,
} from '../lib/mock-data';
import { api } from '../lib/api';
import { globalAudioPlayer } from '../lib/audio-player';

interface LiveSessionState {
  id: string;
  wsToken?: string;
  jobTitle: string;
  company: string;
  currentRoundIndex: number;
  currentQuestionIndex: number;
  followUpsAsked: number;
  timeRemainingSeconds: number;
  isPaused: boolean;
  pauseReason: 'user' | 'face' | 'mic' | 'phone' | null;
  isAudioStreaming: boolean;
  isInterviewerSpeaking: boolean;
  isCandidateSpeaking: boolean;
  isMicMuted: boolean;
  isFaceDetected: boolean;
  awaitingInterviewer: boolean;
  serverConnected: boolean;
  interviewerCaption: string;
  turns: Turn[];
  activeWarning: { type: 'face' | 'mic' | 'network' | 'phone'; message: string } | null;
  codeOutput: { stdout: string; stderr: string; passed: boolean; testCases: { name: string; passed: boolean }[] } | null;
}

interface AppStoreState {
  jobAnalysis: JobAnalysis;
  plan: InterviewPlan;
  personas: Persona[];
  activePersona: Persona;
  activeModeId: string;
  liveSession: LiveSessionState;
  report: EvaluationReport;
  coachingSections: CoachingSection[];
  practiceAttempts: PracticeAttempt[];
  weakAreas: WeakAreaItem[];
  retryQueue: RetryQuestion[];
  answerLibrary: AnswerLibraryItem[];

  setJobTarget: (jdText: string, resumeName?: string, date?: string) => Promise<void>;
  updateSkillConfidence: (skillId: string, delta: number) => void;
  setMode: (modeId: any) => Promise<void>;
  setPersona: (personaId: string) => Promise<void>;
  
  startLiveSession: () => Promise<string>;
  togglePauseSession: () => void;
  setSessionPaused: (paused: boolean, reason?: LiveSessionState['pauseReason']) => void;
  toggleMicMuted: () => void;
  interruptInterviewer: () => void;
  endLiveSession: () => Promise<void>;
  submitCandidateAnswer: (text: string, kind?: 'text' | 'code') => void;
  triggerWarning: (type: 'face' | 'mic' | 'network' | 'phone', message: string) => void;
  clearWarning: () => void;
  markServerConnected: (connected: boolean) => void;
  setFaceDetected: (detected: boolean) => void;

  handleServerCaptions: (text: string, turnId: string) => void;
  handleServerState: (data: any) => void;
  handleSessionEnded: () => void;

  addPracticeAttempt: (coachingSectionId: string, attemptText: string) => Promise<void>;
  removeRetryQuestion: (id: string) => void;
}

const MAX_FOLLOW_UPS: Record<string, number> = {
  practice: 1,
  learning: 1,
  realistic: 2,
  pressure: 3,
  company_sim: 3,
  final_mock: 4,
};

const FOLLOW_UP_LINES = [
  'Got it. Can you walk me through a specific example — what you did and how it turned out?',
  'What was the hardest part of that, and how did you decide what to do?',
  'If you had to do that again, what would you change?',
];

const ROUND_KEYS = ['warmup', 'behavioral', 'technical', 'coding', 'candidate_questions', 'closing'];

function roundToIndex(round?: string, fallback = 0) {
  if (!round) return fallback;
  const key = round.toLowerCase().replace(/\s+/g, '_');
  const byKey = ROUND_KEYS.indexOf(key);
  if (byKey >= 0) return byKey;
  if (round.toLowerCase().includes('warm')) return 0;
  if (round.toLowerCase().includes('behav')) return 1;
  if (round.toLowerCase().includes('tech')) return 2;
  if (round.toLowerCase().includes('cod')) return 3;
  if (round.toLowerCase().includes('question')) return 4;
  if (round.toLowerCase().includes('close')) return 5;
  return fallback;
}

const SAMPLE_QUESTIONS = [
  {
    round: 'Warm-up & Background',
    text: 'Tell me about yourself and why you are interested in this Senior Frontend Engineer role.',
    interviewerIntro:
      "Hi, I'm Alex Rivera, staff engineer on the frontend platform team. We'll start with your background, then some technical discussion, a short coding exercise, and time for your questions. To begin, could you walk me through your background and what draws you to this role?",
  },
  {
    round: 'Behavioral',
    text: 'Describe a time when you had to resolve a complex production outage under pressure.',
    interviewerIntro:
      'Thanks, that is helpful. Tell me about a time you handled a production incident. What was the situation, what did you do, and how did it turn out?',
  },
  {
    round: 'Technical',
    text: "How does React's reconciliation algorithm handle key props in dynamic lists?",
    interviewerIntro:
      "I'd like to shift to a technical question. When React reconciles a dynamic list, what goes wrong if keys are missing or unstable, and how do you think about that in production UI?",
  },
  {
    round: 'Coding',
    text: 'Implement a reusable custom hook useDebounce<T>(value: T, delayMs: number): T in TypeScript with cleanup.',
    interviewerIntro:
      "Let's do a short coding exercise. Please implement a reusable useDebounce hook with proper cleanup, then run it when you are ready. I'll stay on the call if you want to talk through it.",
  },
  {
    round: 'Your questions',
    text: 'What questions do you have for me about the team or the role?',
    interviewerIntro:
      'I want to leave time for you. What questions do you have for me about the team, the role, or how we work?',
  },
  {
    round: 'Close',
    text: 'Thanks for your time.',
    interviewerIntro:
      "Those are good questions. That's all I had for today — thanks for walking through that with me. We'll follow up with next steps.",
  },
];

export const useAppStore = create<AppStoreState>((set, get) => ({
  jobAnalysis: INITIAL_JOB_ANALYSIS,
  plan: INITIAL_PLAN,
  personas: PERSONAS,
  activePersona: PERSONAS[0],
  activeModeId: 'realistic',

  liveSession: {
    id: 'sess-892',
    jobTitle: 'Senior Frontend Engineer',
    company: 'Stripe (Simulated)',
    currentRoundIndex: 0,
    currentQuestionIndex: 0,
    followUpsAsked: 0,
    timeRemainingSeconds: 2700,
    isPaused: false,
    pauseReason: null,
    isAudioStreaming: false,
    isInterviewerSpeaking: true,
    isCandidateSpeaking: false,
    isMicMuted: false,
    isFaceDetected: true,
    awaitingInterviewer: false,
    serverConnected: false,
    interviewerCaption: SAMPLE_QUESTIONS[0].interviewerIntro,
    turns: [
      {
        id: 't-1',
        sessionId: 'sess-892',
        round: 'Warm-up',
        seq: 1,
        speaker: 'interviewer',
        text: SAMPLE_QUESTIONS[0].interviewerIntro,
        startMs: 0,
        endMs: 4500,
      },
    ],
    activeWarning: null,
    codeOutput: null,
  },

  report: RECENT_EVALUATION_REPORT,
  coachingSections: INITIAL_COACHING_SECTIONS,
  practiceAttempts: INITIAL_PRACTICE_ATTEMPTS,
  weakAreas: WEAK_AREAS_DATA,
  retryQueue: RETRY_MISTAKES_DATA,
  answerLibrary: ANSWER_LIBRARY_DATA,

  setJobTarget: async (jdText, resumeName, date) => {
    set((state) => ({
      jobAnalysis: {
        ...state.jobAnalysis,
        jdText,
        resumeFileName: resumeName || state.jobAnalysis.resumeFileName,
        targetInterviewDate: date || state.jobAnalysis.targetInterviewDate,
      },
    }));

    try {
      const res = await api.createJob({
        title: get().jobAnalysis.jobTitle,
        company: get().jobAnalysis.company,
        experienceLevel: get().jobAnalysis.experienceLevel,
        jdText,
        resumeText: resumeName,
        targetInterviewDate: date,
      });

      if (res && res.parsedSkills) {
        set((state) => ({
          jobAnalysis: {
            ...state.jobAnalysis,
            id: res.id,
            parsedSkills: res.parsedSkills,
            focusAreas: res.focusAreas || state.jobAnalysis.focusAreas,
          },
        }));
      }
    } catch {
      // Retain mock fallback
    }
  },

  updateSkillConfidence: (skillId, delta) => {
    set((state) => ({
      jobAnalysis: {
        ...state.jobAnalysis,
        parsedSkills: state.jobAnalysis.parsedSkills.map((s) =>
          s.id === skillId ? { ...s, confidencePct: Math.min(100, Math.max(10, s.confidencePct + delta)) } : s
        ),
      },
    }));
  },

  setMode: async (modeId) => {
    set((state) => ({
      activeModeId: modeId,
      plan: { ...state.plan, mode: modeId },
    }));

    try {
      await api.updatePlan(get().plan.id, { mode: modeId });
    } catch {}
  },

  setPersona: async (personaId) => {
    const found = PERSONAS.find((p) => p.id === personaId);
    if (found) {
      set((state) => ({
        activePersona: found,
        plan: { ...state.plan, personaId },
      }));
    }

    try {
      await api.updatePlan(get().plan.id, { personaId });
    } catch {}
  },

  startLiveSession: async () => {
    const firstQ = SAMPLE_QUESTIONS[0];
    let sessionId = `sess-${Date.now()}`;
    let wsToken: string | undefined = undefined;

    try {
      const res = await api.createSession({
        planId: get().plan.id || 'plan-101',
        mode: get().activeModeId,
        personaId: get().activePersona.id,
      });
      if (res && res.sessionId) {
        sessionId = res.sessionId;
        wsToken = res.wsToken;
      }
    } catch {}

    set({
      liveSession: {
        id: sessionId,
        wsToken,
        jobTitle: get().jobAnalysis.jobTitle,
        company: get().jobAnalysis.company,
        currentRoundIndex: 0,
        currentQuestionIndex: 0,
        followUpsAsked: 0,
        timeRemainingSeconds: 2700,
        isPaused: false,
        pauseReason: null,
        isAudioStreaming: true,
        isInterviewerSpeaking: true,
        isCandidateSpeaking: false,
        isMicMuted: false,
        isFaceDetected: true,
        awaitingInterviewer: Boolean(wsToken),
        serverConnected: false,
        interviewerCaption: firstQ.interviewerIntro,
        turns: [
          {
            id: `turn-1`,
            sessionId,
            round: firstQ.round,
            seq: 1,
            speaker: 'interviewer',
            text: firstQ.interviewerIntro,
            startMs: 0,
            endMs: 4000,
          },
        ],
        activeWarning: null,
        codeOutput: null,
      },
    });

    return sessionId;
  },

  togglePauseSession: () => {
    set((state) => {
      const nextPaused = !state.liveSession.isPaused;
      return {
        liveSession: {
          ...state.liveSession,
          isPaused: nextPaused,
          pauseReason: nextPaused ? 'user' : null,
        },
      };
    });
  },

  setSessionPaused: (paused, reason = null) => {
    set((state) => ({
      liveSession: {
        ...state.liveSession,
        isPaused: paused,
        pauseReason: paused ? reason : null,
      },
    }));
  },

  interruptInterviewer: () => {
    globalAudioPlayer.clearQueue();
    set((state) => ({
      liveSession: {
        ...state.liveSession,
        isInterviewerSpeaking: false,
        isAudioStreaming: false,
        isCandidateSpeaking: true,
      },
    }));
  },

  toggleMicMuted: () => {
    set((state) => ({
      liveSession: { ...state.liveSession, isMicMuted: !state.liveSession.isMicMuted },
    }));
  },

  markServerConnected: (connected) => {
    set((state) => ({
      liveSession: { ...state.liveSession, serverConnected: connected },
    }));
  },

  setFaceDetected: (detected) => {
    set((state) => ({
      liveSession: { ...state.liveSession, isFaceDetected: detected },
    }));
  },

  endLiveSession: async () => {
    const session = get().liveSession;
    set((state) => ({
      liveSession: { ...state.liveSession, isAudioStreaming: false, isInterviewerSpeaking: false },
    }));

    try {
      await api.endSession(session.id);
      const reportData = await api.getSessionReport(session.id);
      if (reportData) {
        set({ report: reportData });
      }
    } catch {}
  },

  submitCandidateAnswer: (text, kind = 'text') => {
    const session = get().liveSession;
    const modeId = get().activeModeId;
    const currentQIndex = session.currentQuestionIndex;

    const candidateTurn: Turn = {
      id: `turn-cand-${Date.now()}`,
      sessionId: session.id,
      round: SAMPLE_QUESTIONS[currentQIndex].round,
      seq: session.turns.length + 1,
      speaker: 'candidate',
      text,
      startMs: Date.now() - 10000,
      endMs: Date.now(),
      questionId: `q${currentQIndex + 1}`,
    };

    let simulatedCodeOutput = session.codeOutput;
    if (kind === 'code') {
      simulatedCodeOutput = {
        stdout: 'Running 4 unit checks...\n✔ Test 1: Initial value debounced (PASSED)\n✔ Test 2: Timer reset on rapid input (PASSED)\n✔ Test 3: Unmount timer cleanup (PASSED)\n✔ Test 4: Generic type preservation (PASSED)\n\nAll 4 test cases passed cleanly.',
        stderr: '',
        passed: true,
        testCases: [
          { name: 'Initial value debounced', passed: true },
          { name: 'Timer reset on rapid input', passed: true },
          { name: 'Unmount timer cleanup', passed: true },
          { name: 'Generic type preservation', passed: true },
        ],
      };
    }

    if (session.serverConnected) {
      set({
        liveSession: {
          ...session,
          isCandidateSpeaking: false,
          isInterviewerSpeaking: true,
          awaitingInterviewer: true,
          turns: [...session.turns, candidateTurn],
          codeOutput: simulatedCodeOutput,
        },
      });
      return;
    }

    const maxFollowUps = MAX_FOLLOW_UPS[modeId] ?? 2;
    const canFollowUp =
      kind !== 'code' &&
      SAMPLE_QUESTIONS[currentQIndex].round !== 'Close' &&
      session.followUpsAsked < maxFollowUps;

    let interviewerText: string;
    let nextQIndex = currentQIndex;
    let nextRoundIndex = session.currentRoundIndex;
    let followUpsAsked = session.followUpsAsked;

    if (canFollowUp) {
      interviewerText = FOLLOW_UP_LINES[session.followUpsAsked % FOLLOW_UP_LINES.length];
      followUpsAsked += 1;
    } else {
      nextQIndex = Math.min(SAMPLE_QUESTIONS.length - 1, currentQIndex + 1);
      nextRoundIndex = Math.min(get().plan.rounds.length - 1, nextQIndex);
      followUpsAsked = 0;
      interviewerText = SAMPLE_QUESTIONS[nextQIndex].interviewerIntro;
    }

    const interviewerTurn: Turn = {
      id: `turn-int-${Date.now()}`,
      sessionId: session.id,
      round: SAMPLE_QUESTIONS[nextQIndex].round,
      seq: session.turns.length + 2,
      speaker: 'interviewer',
      text: interviewerText,
      startMs: Date.now(),
      endMs: Date.now() + 4000,
    };

    globalAudioPlayer.speakText(interviewerText);

    set({
      liveSession: {
        ...session,
        currentQuestionIndex: nextQIndex,
        currentRoundIndex: nextRoundIndex,
        followUpsAsked,
        isCandidateSpeaking: false,
        isInterviewerSpeaking: true,
        awaitingInterviewer: false,
        interviewerCaption: interviewerText,
        turns: [...session.turns, candidateTurn, interviewerTurn],
        codeOutput: simulatedCodeOutput,
      },
    });
  },

  handleServerCaptions: (text, turnId) => {
    const session = get().liveSession;
    const newTurn: Turn = {
      id: turnId || `turn-int-${Date.now()}`,
      sessionId: session.id,
      round: get().plan.rounds[session.currentRoundIndex]?.name || 'Interview',
      seq: session.turns.length + 1,
      speaker: 'interviewer',
      text,
      startMs: Date.now(),
      endMs: Date.now() + 3000,
    };

    set({
      liveSession: {
        ...session,
        isInterviewerSpeaking: true,
        isCandidateSpeaking: false,
        awaitingInterviewer: false,
        interviewerCaption: text,
        turns: [...session.turns, newTurn],
      },
    });
  },

  handleServerState: (data) => {
    if (!data) return;
    set((state) => ({
      liveSession: {
        ...state.liveSession,
        timeRemainingSeconds: data.timeRemaining ?? state.liveSession.timeRemainingSeconds,
        currentRoundIndex: roundToIndex(data.round, state.liveSession.currentRoundIndex),
        currentQuestionIndex: Math.max(
          0,
          (data.questionIndex || 1) - 1
        ),
        awaitingInterviewer: data.isCompleted ? false : state.liveSession.awaitingInterviewer,
      },
    }));
  },

  handleSessionEnded: async () => {
    get().endLiveSession();
  },

  triggerWarning: (type, message) => {
    set((state) => {
      const shouldPause = type === 'face' || type === 'phone';
      return {
        liveSession: {
          ...state.liveSession,
          activeWarning: { type, message },
          isPaused: shouldPause ? true : state.liveSession.isPaused,
          pauseReason: shouldPause ? type : state.liveSession.pauseReason,
        },
      };
    });
  },

  clearWarning: () => {
    set((state) => {
      const reason = state.liveSession.pauseReason;
      const resume = reason === 'face' || reason === 'phone' || reason === 'mic';
      return {
        liveSession: {
          ...state.liveSession,
          activeWarning: null,
          isPaused: resume ? false : state.liveSession.isPaused,
          pauseReason: resume ? null : reason,
        },
      };
    });
  },

  addPracticeAttempt: async (coachingSectionId, attemptText) => {
    let newAttempt: PracticeAttempt = {
      id: `prac-${Date.now()}`,
      coachingSectionId,
      attemptText,
      score: 86,
      comparedToOriginalDelta: 12,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await api.submitPracticeAttempt(coachingSectionId, attemptText);
      if (res && res.id) {
        newAttempt = {
          id: res.id,
          coachingSectionId,
          attemptText: res.attemptText,
          score: res.score,
          comparedToOriginalDelta: res.comparedToOriginalDelta,
          createdAt: res.createdAt,
        };
      }
    } catch {}

    set((state) => ({
      practiceAttempts: [newAttempt, ...state.practiceAttempts],
      coachingSections: state.coachingSections.map((sec) =>
        sec.id === coachingSectionId ? { ...sec, practiced: true } : sec
      ),
    }));
  },

  removeRetryQuestion: (id) => {
    set((state) => ({
      retryQueue: state.retryQueue.filter((q) => q.id !== id),
    }));
  },
}));
