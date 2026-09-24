export type InterviewMode =
  | 'practice'
  | 'realistic'
  | 'pressure'
  | 'learning'
  | 'company_sim'
  | 'final_mock';

export interface ModeConfigPreset {
  id: InterviewMode;
  name: string;
  description: string;
  hintsAllowed: boolean;
  interruptFrequency: 'never' | 'low' | 'medium' | 'high';
  followUpIntensity: 'gentle' | 'moderate' | 'rigorous' | 'relentless';
  thinkTimeSeconds: number;
  confidenceLevel: number;
}

export const MODE_CONFIGS: Record<InterviewMode, ModeConfigPreset> = {
  practice: {
    id: 'practice',
    name: 'Practice Mode',
    description: 'Low-stakes environment with optional hints and friendly follow-ups.',
    hintsAllowed: true,
    interruptFrequency: 'never',
    followUpIntensity: 'gentle',
    thinkTimeSeconds: 60,
    confidenceLevel: 1,
  },
  realistic: {
    id: 'realistic',
    name: 'Realistic Mode',
    description: 'Standard consumer simulation matching typical technical interview conditions.',
    hintsAllowed: false,
    interruptFrequency: 'low',
    followUpIntensity: 'moderate',
    thinkTimeSeconds: 30,
    confidenceLevel: 2,
  },
  pressure: {
    id: 'pressure',
    name: 'Pressure Mode',
    description: 'Fast pacing with relentless follow-ups and rapid time constraints.',
    hintsAllowed: false,
    interruptFrequency: 'high',
    followUpIntensity: 'relentless',
    thinkTimeSeconds: 15,
    confidenceLevel: 3,
  },
  learning: {
    id: 'learning',
    name: 'Learning Mode',
    description: 'Guided breakdown with live hints and structure tips after each turn.',
    hintsAllowed: true,
    interruptFrequency: 'never',
    followUpIntensity: 'gentle',
    thinkTimeSeconds: 45,
    confidenceLevel: 1,
  },
  company_sim: {
    id: 'company_sim',
    name: 'Company Simulation',
    description: 'Tailored persona and question style matching the specific target company.',
    hintsAllowed: false,
    interruptFrequency: 'medium',
    followUpIntensity: 'rigorous',
    thinkTimeSeconds: 30,
    confidenceLevel: 4,
  },
  final_mock: {
    id: 'final_mock',
    name: 'Final Mock (Pre-Interview)',
    description: 'The night-before simulation under complete exam conditions.',
    hintsAllowed: false,
    interruptFrequency: 'medium',
    followUpIntensity: 'rigorous',
    thinkTimeSeconds: 20,
    confidenceLevel: 5,
  },
};
