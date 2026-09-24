import { Injectable } from '@nestjs/common';

@Injectable()
export class LanguageCoachService {
  analyzeLanguage(text: string) {
    const issues: string[] = [];
    const lower = text.toLowerCase();

    if (lower.includes('um') || lower.includes('uh')) {
      issues.push('High frequency of vocal hesitation pauses ("um", "uh")');
    }
    if (lower.includes('kind of') || lower.includes('sort of') || lower.includes('i think maybe')) {
      issues.push('Hedging phrases present ("kind of", "I think maybe"); state conclusions with confidence');
    }
    if (lower.includes('like')) {
      issues.push('Filler word "like" detected during technical explanation');
    }

    return {
      hasLanguageIssues: issues.length > 0,
      issues,
    };
  }
}
