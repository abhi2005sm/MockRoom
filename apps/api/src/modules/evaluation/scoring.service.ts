import { Injectable } from '@nestjs/common';
import { VerdictType } from '@mockroom/shared';

export const CATEGORY_WEIGHTS = {
  technical: 0.30,
  communication: 0.20,
  coding: 0.15,
  speech_delivery: 0.15,
  confidence: 0.10,
  presence: 0.05,
  professionalism: 0.05,
};

@Injectable()
export class ScoringService {
  calculateOverallScore(categories: { name: string; score: number }[]): { overallScore: number; verdict: VerdictType } {
    let weightedSum = 0;
    let weightSum = 0;

    categories.forEach((cat) => {
      const weight = CATEGORY_WEIGHTS[cat.name as keyof typeof CATEGORY_WEIGHTS] || 0.1;
      weightedSum += cat.score * weight;
      weightSum += weight;
    });

    const overallScore = Math.round(weightSum > 0 ? weightedSum / weightSum : 80);

    let verdict: VerdictType = 'Ready';
    if (overallScore >= 85) verdict = 'Strong';
    else if (overallScore >= 75) verdict = 'Ready';
    else if (overallScore >= 60) verdict = 'Almost there';
    else verdict = 'Not ready';

    return { overallScore, verdict };
  }
}
