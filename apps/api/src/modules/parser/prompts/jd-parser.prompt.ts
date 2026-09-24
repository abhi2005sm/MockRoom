export interface JdParserInput {
  jobTitle: string;
  company: string;
  jdText: string;
  resumeText?: string;
}

export const JD_PARSER_PROMPT_VERSION = 'v1.0.0';

export function buildJdParserPrompt(input: JdParserInput): string {
  return `You are an expert technical interviewer and talent evaluator. Analyze the following Job Description and candidate Resume.

Job Title: ${input.jobTitle}
Company: ${input.company}
Job Description:
"""
${input.jdText}
"""

${input.resumeText ? `Candidate Resume:\n"""\n${input.resumeText}\n"""` : 'No candidate resume provided.'}

Instructions:
1. Extract the core required skills and tag each with a sourceType:
   - "verified": Confirmed company requirements explicitly listed in the JD.
   - "reported": Candidate skills explicitly mentioned in their resume.
   - "inferred": Expected industry skills inferred from the job level/title.
2. Return JSON ONLY matching this schema:
{
  "parsedSkills": [
    {
      "id": "skill-1",
      "name": "Skill Name",
      "category": "Frontend | Backend | System Design | Behavioral | DevOps",
      "importance": "primary | secondary",
      "sourceType": "verified | reported | inferred",
      "confidencePct": 85,
      "description": "Brief context"
    }
  ],
  "focusAreas": [
    {
      "area": "Area Name",
      "rationale": "Why this area matters",
      "sourceType": "verified | reported | inferred"
    }
  ]
}
`;
}
