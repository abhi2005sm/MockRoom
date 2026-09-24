export interface CoachingRewritePromptInput {
  questionText: string;
  originalText: string;
  sectionType: string;
  jobTitle: string;
}

export const COACHING_REWRITE_PROMPT_VERSION = 'v2.0.0';

export function buildCoachingRewritePrompt(input: CoachingRewritePromptInput): string {
  return `You are an expert Executive Speech & Interview Communication Coach. Your goal is to produce a "Say It Like This" refined answer rewrite for the candidate.

Target Role: ${input.jobTitle}
Section Type: ${input.sectionType}
Question: "${input.questionText}"
Original Candidate Answer: "${input.originalText}"

Strict Coaching Rules:
1. NEVER invent new experience, companies, metrics, or technologies that the candidate did NOT state in their original answer.
2. Only restructure, sharpen, and apply professional STAR framing to what the candidate actually said.
3. Highlight 2-3 specific issues (e.g. filler words, buried lead, lack of metrics).
4. Provide 2-3 bullet points explaining why the rewrite is stronger.

Return valid JSON ONLY matching this schema:
{
  "issues": ["Buried the technical resolution lead", "Used hedging phrases"],
  "rewrittenText": "Refined spoken version using candidate's real facts...",
  "reasoning": ["Leads with the immediate outcome first", "Uses active voice"]
}
`;
}
