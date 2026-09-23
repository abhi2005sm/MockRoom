'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, Mic, Check, ArrowRight, RefreshCw, Sparkles, Volume2 } from 'lucide-react';
import { useAppStore } from '../../../../store/session.store';
import { SelfIntroTrend } from '../../../../components/coach/SelfIntroTrend';

export default function SelfIntroTrainerPage() {
  const { coachingSections, addPracticeAttempt } = useAppStore();
  const introSection = coachingSections.find((s) => s.sectionType === 'intro') || coachingSections[0];

  const [attemptText, setAttemptText] = useState(introSection.rewrittenText);
  const [recordedAttempts, setRecordedAttempts] = useState([
    { attemptNum: 1, score: 64, text: introSection.originalText },
    { attemptNum: 2, score: 72, text: 'I am a frontend developer with 4 years experience...' },
    { attemptNum: 3, score: 81, text: 'I am a Frontend Engineer specializing in high-concurrency React...' },
    { attemptNum: 4, score: 88, text: introSection.rewrittenText },
  ]);

  const [isRecording, setIsRecording] = useState(false);

  const handleReRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const newScore = Math.min(96, Math.max(85, Math.floor(88 + Math.random() * 8)));
      setRecordedAttempts([
        ...recordedAttempts,
        { attemptNum: recordedAttempts.length + 1, score: newScore, text: attemptText },
      ]);
      addPracticeAttempt(introSection.id, attemptText);
    }, 2000);
  };

  const bestAttempt = recordedAttempts.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <header className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-accent-light text-accent text-xs font-semibold font-heading uppercase mb-1">
            Dedicated Trainer
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Self-Introduction Trainer
          </h1>
          <p className="text-muted text-sm sm:text-base mt-1">
            Lock in your 60-second elevator pitch through attempt-over-attempt practice.
          </p>
        </div>

        <Link
          href="/coach"
          className="text-xs text-muted hover:text-ink font-medium underline"
        >
          ← Back to Communication Coach
        </Link>
      </header>

      {/* Hero Section: Attempt-over-attempt line chart + Current Best Version */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Attempt-over-attempt Line Chart */}
        <SelfIntroTrend />

        {/* Right: Current Best Version Front & Center */}
        <div className="bg-surface border-2 border-accent rounded-lg p-6 space-y-4 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider font-heading flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent" />
              Current Best Pitch
            </span>
            <span className="text-xs font-bold text-accent-warm font-heading px-2.5 py-0.5 rounded bg-accent-warm-light">
              Score: {bestAttempt.score} / 100
            </span>
          </div>

          <p className="text-base font-heading font-medium text-ink leading-relaxed">
            "{bestAttempt.text}"
          </p>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>Attempt #{bestAttempt.attemptNum} (Highest accuracy)</span>
            <span className="text-accent font-medium font-body">STAR structure aligned</span>
          </div>
        </div>
      </div>

      {/* Practice & Re-record Workspace */}
      <section className="bg-surface border border-border rounded-lg p-6 space-y-5 shadow-soft">
        <h2 className="text-lg font-heading font-bold text-ink">
          Practice & Record New Attempt
        </h2>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider font-heading">
            Script / Pitch Draft
          </label>
          <textarea
            rows={5}
            value={attemptText}
            onChange={(e) => setAttemptText(e.target.value)}
            className="w-full p-4 bg-bg border border-border rounded-md text-sm text-ink font-body leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border">
          <p className="text-xs text-muted">
            Aim for 60 seconds (approx. 130–150 words). Focus on Past → Present → Stripe impact.
          </p>

          <button
            onClick={handleReRecord}
            disabled={isRecording}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-accent hover:bg-accent-hover text-surface font-medium text-sm transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            {isRecording ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Listening & Scoring Pitch...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Record pitch attempt
              </>
            )}
          </button>
        </div>
      </section>

      {/* Past Attempt History List */}
      <section className="space-y-3">
        <h3 className="text-sm font-heading font-bold text-ink">
          Attempt History
        </h3>

        <div className="space-y-2">
          {recordedAttempts.map((att) => (
            <div
              key={att.attemptNum}
              className="p-4 bg-surface border border-border rounded-md flex items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <span className="font-heading font-bold text-ink">
                  Attempt #{att.attemptNum}
                </span>
                <p className="text-muted italic line-clamp-2">"{att.text}"</p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-heading font-bold text-sm text-accent-warm">
                  {att.score}
                </span>
                <span className="text-muted text-[10px] block">/ 100</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
