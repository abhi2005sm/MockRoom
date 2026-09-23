'use client';

import React, { useState } from 'react';
import { CoachingSection } from '../../lib/shared/types';
import { Sparkles, Check, AlertCircle, ArrowRight, Mic, Play, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

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
    <div className="bg-surface border border-border rounded-lg p-6 space-y-6 shadow-soft">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-accent-light text-accent font-heading font-semibold text-xs uppercase">
            {section.sectionType}
          </span>
          {submitted && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent font-heading">
              <Check className="w-3.5 h-3.5" />
              Practiced
            </span>
          )}
        </div>

        <span className="text-xs text-muted">Question ID: {section.questionId}</span>
      </div>

      <h3 className="font-heading font-bold text-ink text-base">
        {section.questionText}
      </h3>

      {/* Grid Comparison: Original Answer vs Problem Bullets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Answer */}
        <div className="bg-bg border border-border rounded-md p-4 space-y-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading block">
            Original Answer Given
          </span>
          <p className="text-xs text-ink italic leading-relaxed">
            "{section.originalText}"
          </p>
        </div>

        {/* Specific Problem Bullets (2-3 short bullets) */}
        <div className="bg-severity-weak-bg border border-severity-weak/20 rounded-md p-4 space-y-2">
          <span className="text-xs font-semibold text-severity-weak uppercase tracking-wider font-heading flex items-center gap-1.5">
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

      {/* Visually Distinct Rewrite ("The Good Version") */}
      <div className="bg-accent-light/50 border-2 border-accent/40 rounded-lg p-5 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent" />
            Say It Like This (Refined Version)
          </span>
          <span className="text-[11px] font-heading font-bold text-accent px-2 py-0.5 rounded bg-surface border border-accent/20">
            Recommended Structure
          </span>
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
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-muted">
            {submitted ? 'Score delta: +14 points improved' : 'Practice reading this version out loud to lock in memory'}
          </span>
          <button
            onClick={() => setIsPracticing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-surface font-medium text-xs sm:text-sm transition-colors focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Mic className="w-4 h-4" />
            Practice this version
          </button>
        </div>
      ) : (
        <div className="p-4 bg-surface border border-border rounded-md space-y-3 animate-fade-in">
          <label className="block text-xs font-semibold text-ink font-heading">
            Read or re-record your version:
          </label>
          <textarea
            rows={4}
            value={practiceText}
            onChange={(e) => setPracticeText(e.target.value)}
            className="w-full p-3 bg-bg border border-border rounded text-xs text-ink leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-surface text-xs font-semibold rounded font-heading transition-colors"
            >
              Save practice attempt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
