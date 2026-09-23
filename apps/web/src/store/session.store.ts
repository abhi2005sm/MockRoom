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

interface LiveSessionState {
  id: string;
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

  setJobTarget: (jdText: string, resumeName?: string, date?: string) => void;
  updateSkillConfidence: (skillId: string, delta: number) => void;
  setMode: (modeId: any) => void;
  setPersona: (personaId: string) => void;
  
  startLiveSession: () => void;
  togglePauseSession: () => void;
  endLiveSession: () => void;
  submitCandidateAnswer: (text: string, kind?: 'text' | 'code') => void;
  triggerWarning: (type: 'face' | 'mic' | 'network', message: string) => void;
  clearWarning: () => void;
  
  addPracticeAttempt: (coachingSectionId: string, attemptText: string) => void;
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

  setJobTarget: (jdText, resumeName, date) => {
    set((state) => ({
      jobAnalysis: {
        ...state.jobAnalysis,
        jdText,
        resumeFileName: resumeName || state.jobAnalysis.resumeFileName,
        targetInterviewDate: date || state.jobAnalysis.targetInterviewDate,
      },
    }));
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

  setMode: (modeId) => {
    set((state) => ({
      activeModeId: modeId,
      plan: { ...state.plan, mode: modeId },
    }));
  },

  setPersona: (personaId) => {
    const found = PERSONAS.find((p) => p.id === personaId);
    if (found) {
      set((state) => ({
        activePersona: found,
        plan: { ...state.plan, personaId },
      }));
    }
  },

  startLiveSession: () => {
    const firstQ = SAMPLE_QUESTIONS[0];
    set({
      liveSession: {
        id: `sess-${Date.now()}`,
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
            sessionId: `sess-${Date.now()}`,
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

  endLiveSession: () => {
    set((state) => ({
      liveSession: { ...state.liveSession, isAudioStreaming: false, isInterviewerSpeaking: false },
    }));
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

  addPracticeAttempt: (coachingSectionId, attemptText) => {
    const newAttempt: PracticeAttempt = {
      id: `prac-${Date.now()}`,
      coachingSectionId,
      attemptText,
      score: 86,
      comparedToOriginalDelta: 12,
      createdAt: new Date().toISOString(),
    };

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
