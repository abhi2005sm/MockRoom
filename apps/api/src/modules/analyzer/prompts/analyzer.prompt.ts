export interface AnalyzerPromptInput {
  company: string;
  jobTitle: string;
}

export const ANALYZER_PROMPT_VERSION = 'v1.5.0';

export function buildAnalyzerPrompt(input: AnalyzerPromptInput): string {
  return `You are a corporate intelligence analyst researching interview focus areas for ${input.jobTitle} roles at ${input.company}.

Provide structured insights for interview preparation.
Tag every insight as:
- "verified": Confirmed public company engineering blog or job posting data.
- "reported": Common candidate interview reports.
- "inferred": Industry standard expectations for this seniority level.

Return valid JSON ONLY matching schema:
{
  "companyCultureStyle": "High-velocity product delivery with emphasis on system ownership",
  "likelyTechnicalFocus": ["Distributed Caching", "React Server Components", "API Resilience"],
  "sources": [
    { "claim": "Uses Next.js for customer frontend", "sourceType": "verified" }
  ]
}
`;
}
