export type SourceType = 'verified' | 'reported' | 'inferred';
export type InterviewMode = 'practice' | 'realistic' | 'pressure' | 'learning' | 'company_sim' | 'final_mock';
export type SectionType = 'intro' | 'project' | 'technical' | 'behavioral' | 'closing';
export type VerdictType = 'Not ready' | 'Almost there' | 'Ready' | 'Strong';

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  importance: 'primary' | 'secondary';
  sourceType: SourceType;
  confidencePct: number;
  description?: string;
}

export interface JobAnalysis {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  experienceLevel: string;
  jdText: string;
  resumeFileName?: string;
  parsedSkills: SkillItem[];
  focusAreas: { area: string; rationale: string; sourceType: SourceType }[];
  targetInterviewDate?: string;
  createdAt: string;
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  companyStyle: string;
  avatarUrl: string;
  voiceName: string;
  personality: string;
  style: string;
  tone: string;
  followUpIntensity: 'gentle' | 'moderate' | 'rigorous' | 'relentless';
  interruptionRate: 'never' | 'low' | 'medium' | 'high';
  difficulty: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5';
}

export interface ModeConfig {
  id: InterviewMode;
  name: string;
  description: string;
  hintsAllowed: boolean;
  interruptFrequency: string;
  followUpIntensity: string;
  thinkTimeSeconds: number;
  confidenceLevel: number;
}

export interface InterviewRound {
  id: string;
  name: string;
  durationMinutes: number;
  questionCount: number;
  topics: string[];
}

export interface InterviewPlan {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  difficulty: string;
  mode: InterviewMode;
  personaId: string;
  durationMinutes: number;
  totalQuestions: number;
  rounds: InterviewRound[];
  createdAt: string;
}

export interface Turn {
  id: string;
  sessionId: string;
  round: string;
  seq: number;
  speaker: 'interviewer' | 'candidate';
  text: string;
  startMs: number;
  endMs: number;
  questionId?: string;
}

export interface QuestionScoreDimensions {
  relevance: number;
  technicalAccuracy: number;
  structure: number;
  specificity: number;
  confidence: number;
}

export interface QuestionScore {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  round: string;
  score: number;
  dimensions: QuestionScoreDimensions;
  strengths: string[];
  improvements: string[];
  suggestedStructure: string[];
  evidence: { quote: string; atMs: number }[];
  idealAnswer: string;
}

export interface CategoryScore {
  name: string;
  label: string;
  score: number;
  weight: number;
  summary: string;
}

export interface SessionMetrics {
  wordsPerMinute: number;
  fillerCount: number;
  fillerPerMinute: number;
  hedgeCount: number;
  avgPauseMs: number;
  faceVisiblePct: number;
  eyeContactPct: number;
}

export interface SessionTimelineEvent {
  atMs: number;
  type: 'face_lost' | 'mic_low' | 'filler_spike' | 'long_pause' | 'barge_in' | 'code_submit';
  note: string;
}

export interface EvaluationReport {
  sessionId: string;
  overallScore: number;
  verdict: VerdictType;
  summaryLine: string;
  categories: CategoryScore[];
  questions: QuestionScore[];
  metrics: SessionMetrics;
  timeline: SessionTimelineEvent[];
  topRecommendations: string[];
  generatedAt: string;
}

export interface CoachingSection {
  id: string;
  sessionId: string;
  questionId: string;
  sectionType: SectionType;
  questionText: string;
  originalText: string;
  issues: string[];
  rewrittenText: string;
  reasoning: string[];
  tipIds: string[];
  practiced: boolean;
  createdAt: string;
}

export interface PracticeAttempt {
  id: string;
  coachingSectionId: string;
  attemptText: string;
  score: number;
  comparedToOriginalDelta: number;
  createdAt: string;
}

export interface WeakAreaItem {
  id: string;
  category: string;
  title: string;
  frequencyCount: number;
  lastOccurredDate: string;
  impactScore: number;
  recommendation: string;
}

export interface RetryQuestion {
  id: string;
  questionText: string;
  jobTitle: string;
  previousScore: number;
  round: string;
  dateAsked: string;
}

export interface AnswerLibraryItem {
  id: string;
  questionText: string;
  category: string;
  answerText: string;
  score: number;
  jobTitle: string;
  date: string;
  tags: string[];
}
