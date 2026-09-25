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

interface LiveSessionState {
  id: string;
  wsToken?: string;
  jobTitle: string;
  company: string;
  currentRoundIndex: number;
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  isPaused: boolean;
  isAudioStreaming: boolean;
  isInterviewerSpeaking: boolean;
  isCandidateSpeaking: boolean;
  interviewerCaption: string;
  turns: Turn[];
  activeWarning: { type: 'face' | 'mic' | 'network'; message: string } | null;
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
  
  startLiveSession: () => Promise<void>;
  togglePauseSession: () => void;
  endLiveSession: () => Promise<void>;
  submitCandidateAnswer: (text: string, kind?: 'text' | 'code') => void;
  triggerWarning: (type: 'face' | 'mic' | 'network', message: string) => void;
  clearWarning: () => void;
  
  handleServerCaptions: (text: string, turnId: string) => void;
  handleServerState: (data: any) => void;
  handleSessionEnded: () => void;

  addPracticeAttempt: (coachingSectionId: string, attemptText: string) => Promise<void>;
  removeRetryQuestion: (id: string) => void;
}

const SAMPLE_QUESTIONS = [
  {
    round: 'Warm-up & Background',
    text: 'Tell me about yourself and why you are interested in this Senior Frontend Engineer role at Stripe.',
    interviewerIntro: 'Welcome to MockRoom. Let’s start with a warm-up. Could you walk me through your background and interest in Stripe?',
  },
  {
    round: 'Behavioral & STAR',
    text: 'Describe a time when you had to resolve a complex production outage under pressure.',
    interviewerIntro: 'Thanks for sharing that background. Now let’s move to behavioral experience. Tell me about a time you handled a critical production incident.',
  },
  {
    round: 'Technical Depth',
    text: 'How does React’s reconciliation algorithm handle key props in dynamic lists?',
    interviewerIntro: 'Got it. Let’s dive into frontend architecture. Can you explain React’s diffing heuristics and why key props matter?',
  },
  {
    round: 'Live Coding Lab',
    text: 'Implement a reusable custom hook `useDebounce<T>(value: T, delayMs: number): T` in TypeScript with cleanup.',
    interviewerIntro: 'Now let’s open the Code Editor panel. Write a debounced hook and run the automated test checks.',
  },
  {
    round: 'Candidate Questions & Closing',
    text: 'What questions do you have for me about Stripe engineering team culture and architecture decisions?',
    interviewerIntro: 'Great code submission! We are wrapping up. What questions do you have for me?',
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
    timeRemainingSeconds: 2700,
    isPaused: false,
    isAudioStreaming: false,
    isInterviewerSpeaking: true,
    isCandidateSpeaking: false,
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
        timeRemainingSeconds: 2700,
        isPaused: false,
        isAudioStreaming: true,
        isInterviewerSpeaking: true,
        isCandidateSpeaking: false,
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
  },

  togglePauseSession: () => {
    set((state) => ({
      liveSession: { ...state.liveSession, isPaused: !state.liveSession.isPaused },
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
    const currentQIndex = session.currentQuestionIndex;
    const nextQIndex = Math.min(SAMPLE_QUESTIONS.length - 1, currentQIndex + 1);
    const nextQ = SAMPLE_QUESTIONS[nextQIndex];

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

    const interviewerTurn: Turn = {
      id: `turn-int-${Date.now()}`,
      sessionId: session.id,
      round: nextQ.round,
      seq: session.turns.length + 2,
      speaker: 'interviewer',
      text: nextQ.interviewerIntro,
      startMs: Date.now(),
      endMs: Date.now() + 4000,
    };

    set({
      liveSession: {
        ...session,
        currentQuestionIndex: nextQIndex,
        currentRoundIndex: Math.min(4, Math.floor(nextQIndex)),
        isCandidateSpeaking: false,
        isInterviewerSpeaking: true,
        interviewerCaption: nextQ.interviewerIntro,
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
      round: 'Active Round',
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
        timeRemainingSeconds: data.timeRemaining || state.liveSession.timeRemainingSeconds,
      },
    }));
  },

  handleSessionEnded: async () => {
    get().endLiveSession();
  },

  triggerWarning: (type, message) => {
    set((state) => ({
      liveSession: {
        ...state.liveSession,
        activeWarning: { type, message },
      },
    }));
  },

  clearWarning: () => {
    set((state) => ({
      liveSession: {
        ...state.liveSession,
        activeWarning: null,
      },
    }));
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
