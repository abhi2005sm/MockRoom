import { z } from 'zod';

export const JdParserOutputSchema = z.object({
  parsedSkills: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      category: z.string().default('General'),
      importance: z.enum(['primary', 'secondary', 'nice_to_have']).default('primary'),
      sourceType: z.enum(['verified', 'reported', 'inferred']).default('verified'),
      confidencePct: z.number().min(0).max(100).default(80),
      description: z.string().optional(),
    })
  ),
  focusAreas: z.array(
    z.object({
      area: z.string(),
      rationale: z.string(),
      sourceType: z.enum(['verified', 'reported', 'inferred']).default('verified'),
    })
  ),
});

export type JdParserOutput = z.infer<typeof JdParserOutputSchema>;

export const EvaluatorReportOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  verdict: z.enum(['Not ready', 'Almost there', 'Ready', 'Strong']),
  summaryLine: z.string(),
  categories: z.array(
    z.object({
      name: z.string(),
      score: z.number().min(0).max(100),
      summary: z.string(),
    })
  ),
  questions: z.array(
    z.object({
      questionId: z.string(),
      questionText: z.string().optional(),
      round: z.string().optional(),
      score: z.number().min(0).max(100),
      dimensions: z.object({
        relevance: z.number().min(0).max(100),
        technicalAccuracy: z.number().min(0).max(100),
        structure: z.number().min(0).max(100),
        specificity: z.number().min(0).max(100),
        confidence: z.number().min(0).max(100),
      }),
      strengths: z.array(z.string()),
      improvements: z.array(z.string()),
      suggestedStructure: z.array(z.string()).optional(),
      evidence: z
        .array(
          z.object({
            quote: z.string(),
            atMs: z.number(),
          })
        )
        .optional(),
      idealAnswer: z.string().optional(),
    })
  ),
  metrics: z.record(z.any()).optional(),
  timeline: z.array(z.any()).optional(),
  topRecommendations: z.array(z.string()),
});

export type EvaluatorReportOutput = z.infer<typeof EvaluatorReportOutputSchema>;

export const CoachingRewriteOutputSchema = z.object({
  sections: z.array(
    z.object({
      questionId: z.string().optional(),
      sectionType: z.enum(['intro', 'project', 'technical', 'behavioral', 'closing']),
      originalText: z.string(),
      rewrittenText: z.string(),
      issues: z.array(z.string()),
      reasoning: z.array(z.string()),
      tipIds: z.array(z.string()).optional(),
    })
  ),
});

export type CoachingRewriteOutput = z.infer<typeof CoachingRewriteOutputSchema>;

export const SCHEMA_REGISTRY: Record<string, z.ZodSchema<any>> = {
  'jd-parser': JdParserOutputSchema,
  evaluator: EvaluatorReportOutputSchema,
  'coaching-rewrite': CoachingRewriteOutputSchema,
};
