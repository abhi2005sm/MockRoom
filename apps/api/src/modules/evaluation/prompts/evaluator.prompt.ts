export interface EvaluatorPromptInput {
  jobTitle: string;
  company: string;
  transcriptText: string;
  questionsText: string;
  metricsText: string;
}

export const EVALUATOR_PROMPT_VERSION = 'v2.0.0';

export function buildEvaluatorPrompt(input: EvaluatorPromptInput): string {
  return `You are a Senior Technical Hiring Committee Lead evaluating an interview candidate for ${input.jobTitle} at ${input.company}.

Transcript Summary:
"""
${input.transcriptText}
"""

Questions Asked:
"""
${input.questionsText}
"""

Computed Speech Metrics:
"""
${input.metricsText}
"""

Evaluate the candidate's performance across all 7 categories (Technical correctness 30%, Communication 20%, Coding 15%, Speech delivery 15%, Confidence 10%, Presence 5%, Professionalism 5%).

Return strictly valid JSON matching this schema:
{
  "overall": 82,
  "verdict": "Ready",
  "categories": [
    { "name": "technical", "score": 84, "summary": "Strong grasp of React lifecycle and WebSocket synchronization." },
    { "name": "communication", "score": 78, "summary": "Clear STAR structure, minor filler usage." },
    { "name": "coding", "score": 85, "summary": "Debounce function passed all unit test cases." },
    { "name": "speech_delivery", "score": 80, "summary": "Pace 142 WPM, 4 filler words per minute." },
    { "name": "confidence", "score": 75, "summary": "Minor hedging on system scaling questions." },
    { "name": "presence", "score": 92, "summary": "Face visible 96% of session duration." },
    { "name": "professionalism", "score": 90, "summary": "Clean audio setup and prompt responses." }
  ],
  "questions": [
    {
      "questionId": "q-1",
      "score": 82,
      "dimensions": { "relevance": 85, "technicalAccuracy": 84, "structure": 80, "specificity": 80, "confidence": 78 },
      "strengths": ["Structured React component architecture clearly."],
      "improvements": ["Add specific latency numbers to quantify impact."],
      "suggestedStructure": ["Situation: React state lag", "Task: Refactor component", "Action: Added useMemo and WebSockets", "Result: Render time dropped 40%"],
      "evidence": [{ "quote": "We refactored our store to prevent unnecessary renders.", "atMs": 120000 }],
      "idealAnswer": "In my previous project, we faced state latency under high load. I separated local component state from global Zustand stores..."
    }
  ],
  "metrics": {
    "wordsPerMinute": 142,
    "fillerCount": 12,
    "fillerPerMinute": 3.2,
    "hedgeCount": 4,
    "avgPauseMs": 420,
    "faceVisiblePct": 96,
    "eyeContactPct": 88
  },
  "timeline": [
    { "atMs": 120000, "type": "filler_spike", "note": "Frequent 'um' usage during architecture explanation" }
  ],
  "topRecommendations": [
    "Quantify project outcomes with specific percentage or millisecond metrics.",
    "Eliminate hedging phrases like 'I think maybe' when stating technical facts.",
    "Pace your self-introduction to allow natural 1-second pauses between points."
  ]
}
`;
}
