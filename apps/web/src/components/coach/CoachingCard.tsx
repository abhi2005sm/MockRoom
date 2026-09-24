'use client';

import React, { useState } from 'react';
import { CoachingSection } from '../../lib/shared/types';
import { Sparkles, CheckCircle2, AlertCircle, Mic } from 'lucide-react';
import { PillTag } from '../ui/PillTag';

interface CoachingCardProps {
  section: CoachingSection;
  onPractice: (id: string, text: string) => void;
}

export function CoachingCard({ section, onPractice }: CoachingCardProps) {
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceText, setPracticeText] = useState(section.rewrittenText);
  const [submitted, setSubmitted] = useState(section.practiced);

  const handlePracticeSubmit = () => {
    onPractice(section.id, practiceText);
    setSubmitted(true);
    setIsPracticing(false);
  };

  return (
    <div className="bg-surface border border-border rounded-card p-6 space-y-6 shadow-card">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <PillTag label={section.sectionType} variant="accent" />
          {submitted && (
            <PillTag label="Practiced" variant="success" icon={CheckCircle2} />
          )}
        </div>

        <span className="text-xs text-muted">Question #{section.questionId}</span>
      </div>

      <h3 className="font-heading font-bold text-ink text-base sm:text-lg">
        {section.questionText}
      </h3>

      {/* Grid Comparison: Original Answer vs Key Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Answer */}
        <div className="bg-bg border border-border rounded-btn p-4 space-y-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading block">
            Original Answer Given
          </span>
          <p className="text-xs text-ink italic leading-relaxed">
            "{section.originalText}"
          </p>
        </div>

        {/* Specific Problem Bullets */}
        <div className="bg-warning-tint/50 border border-warning/20 rounded-btn p-4 space-y-2">
          <span className="text-xs font-semibold text-warning uppercase tracking-wider font-heading flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Key Issues Identified
          </span>
          <ul className="space-y-1 text-xs text-ink">
            {section.issues.map((issue, idx) => (
              <li key={idx} className="leading-relaxed">• {issue}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Visually Distinct Rewrite ("Say It Like This") */}
      <div className="bg-accent-soft/60 border border-accent/25 rounded-card p-5 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent" />
            Say It Like This (Refined Version)
          </span>
          <PillTag label="Recommended Structure" variant="outline" />
        </div>

        <p className="text-sm sm:text-base font-body font-medium text-ink leading-relaxed">
          "{section.rewrittenText}"
        </p>

        {/* Reasoning */}
        <div className="pt-3 border-t border-accent/20 space-y-1">
          <span className="text-[11px] font-semibold text-accent uppercase font-heading">
            Why this works:
          </span>
          <ul className="text-xs text-muted space-y-0.5">
            {section.reasoning.map((r, idx) => (
              <li key={idx}>• {r}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Practice Module Action */}
      {!isPracticing ? (
        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-muted">
            {submitted
              ? 'Score delta: +14 points improved'
              : 'Practice reading this version out loud to lock in memory'}
          </span>
          <button
            onClick={() => setIsPracticing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-accent hover:bg-accent-hover text-surface font-semibold text-xs sm:text-sm transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Mic className="w-4 h-4" />
            Practice This Version
          </button>
        </div>
      ) : (
        <div className="p-4 bg-surface border border-border rounded-btn space-y-3 animate-fade-in shadow-sm">
          <label className="block text-xs font-semibold text-ink font-heading">
            Read or re-record your version:
          </label>
          <textarea
            rows={4}
            value={practiceText}
            onChange={(e) => setPracticeText(e.target.value)}
            className="w-full p-3 bg-bg border border-border rounded-btn text-xs sm:text-sm text-ink leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsPracticing(false)}
              className="px-3 py-1.5 text-xs text-muted hover:text-ink font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handlePracticeSubmit}
              className="px-5 py-2 bg-accent hover:bg-accent-hover text-surface text-xs font-semibold rounded-pill transition-colors shadow-xs"
            >
              Save Practice Attempt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
