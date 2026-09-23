'use client';

import React, { useState } from 'react';
import { QuestionScore } from '../../lib/shared/types';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { clsx } from 'clsx';

interface QuestionBreakdownProps {
  questions: QuestionScore[];
}

export function QuestionBreakdown({ questions }: QuestionBreakdownProps) {
  const [expandedId, setExpandedId] = useState<string>(questions[0]?.questionId || '');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? '' : id);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => {
        const isExpanded = expandedId === q.questionId;

        return (
          <div
            key={q.questionId}
            className="bg-surface border border-border rounded-lg overflow-hidden transition-colors"
          >
            {/* Question Summary Header */}
            <button
              onClick={() => toggleExpand(q.questionId)}
              className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-bg/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-heading font-medium text-muted">
                  <span>Question {idx + 1}</span>
                  <span>•</span>
                  <span className="text-accent">{q.round}</span>
                </div>
                <h3 className="font-heading font-bold text-ink text-base">
                  {q.questionText}
                </h3>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <span className="font-heading font-bold text-lg text-ink">
                    {q.score}
                  </span>
                  <span className="text-xs text-muted block">/ 100</span>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted" />
                )}
              </div>
            </button>

            {/* Expandable Mentor Notes & Dimension Scores */}
            {isExpanded && (
              <div className="px-5 pb-6 pt-2 border-t border-border space-y-6 animate-fade-in">
                {/* 5-Dimensional Breakdown Bar */}
                <div className="bg-bg border border-border rounded-md p-4 space-y-3">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading block">
                    Dimensional Scoring Breakdown
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    {Object.entries(q.dimensions).map(([dim, score]) => (
                      <div key={dim} className="p-2 bg-surface border border-border rounded text-xs">
                        <span className="text-[11px] text-muted capitalize block font-body">{dim}</span>
                        <span className="font-heading font-bold text-ink text-sm">{score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Candidate Answer Quote */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading">
                    Your Response
                  </span>
                  <p className="text-sm text-ink italic bg-bg/60 p-3 rounded border border-border/60 leading-relaxed">
                    "{q.candidateAnswer}"
                  </p>
                </div>

                {/* Mentor Review Cards: What worked / What was missing / Suggested structure */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* What Worked */}
                  <div className="bg-surface border border-border rounded-md p-4 space-y-2">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider font-heading flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      What Worked
                    </span>
                    <ul className="space-y-1.5 text-xs text-ink">
                      {q.strengths.map((item, i) => (
                        <li key={i} className="leading-relaxed">• {item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* What Was Missing */}
                  <div className="bg-surface border border-border rounded-md p-4 space-y-2">
                    <span className="text-xs font-semibold text-accent-warm uppercase tracking-wider font-heading flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      What Was Missing
                    </span>
                    <ul className="space-y-1.5 text-xs text-ink">
                      {q.improvements.map((item, i) => (
                        <li key={i} className="leading-relaxed">• {item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Structure */}
                  <div className="bg-surface border border-border rounded-md p-4 space-y-2">
                    <span className="text-xs font-semibold text-ink uppercase tracking-wider font-heading flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-accent" />
                      Suggested Structure
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted">
                      {q.suggestedStructure.map((item, i) => (
                        <li key={i} className="leading-relaxed">{i + 1}. {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
