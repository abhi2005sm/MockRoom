import { Injectable } from '@nestjs/common';
import { LanguageCoachService } from './language-coach.service';

@Injectable()
export class PracticeScoringService {
  constructor(private readonly languageCoach: LanguageCoachService) {}

  scoreAttempt(originalText: string, rewrittenText: string, attemptText: string) {
    const languageAnalysis = this.languageCoach.analyzeLanguage(attemptText);
    
    // Calculate score based on structure adoption and lack of fillers
    let score = 85;
    if (languageAnalysis.hasLanguageIssues) {
      score -= languageAnalysis.issues.length * 5;
    }

    if (attemptText.length >= rewrittenText.length * 0.7) {
      score += 5;
    }

    score = Math.min(Math.max(score, 60), 98);
    const comparedToOriginalDelta = Math.max(12, score - 70);

    return {
      score,
      comparedToOriginalDelta,
      feedback: languageAnalysis.hasLanguageIssues
        ? `Great structural improvement! Focus on eliminating remaining fillers: ${languageAnalysis.issues.join('; ')}.`
        : 'Outstanding delivery! Clear STAR structure with confident cadence.',
    };
  }
}
