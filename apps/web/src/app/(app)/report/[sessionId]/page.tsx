'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Share2, Award, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '../../../../store/session.store';
import { CategoryRadar } from '../../../../components/report/CategoryRadar';
import { QuestionBreakdown } from '../../../../components/report/QuestionBreakdown';

export default function ReportPage() {
  const { report, jobAnalysis } = useAppStore();

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <header className="border-b border-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Interview Performance Report
          </h1>
          <p className="text-muted text-sm sm:text-base mt-1">
            Session evaluation for <span className="text-ink font-medium">{jobAnalysis.jobTitle}</span> at {jobAnalysis.company}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-surface font-medium text-sm transition-colors"
          >
            Communication Coach rewrites
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Top Banner: Overall Score & Stated Verdict */}
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading">
              Overall Hire-Readiness Verdict
            </span>
            <span className="px-3 py-1 rounded bg-accent-warm-light text-accent-warm font-heading font-bold text-xs uppercase">
              {report.verdict}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink leading-snug">
            {report.summaryLine}
          </h2>

          <div className="flex items-center gap-4 text-xs text-muted pt-1">
            <span>WPM: {report.metrics.wordsPerMinute}</span>
            <span>•</span>
            <span>Filler words: {report.metrics.fillerCount}</span>
            <span>•</span>
            <span>Face visible: {report.metrics.faceVisiblePct}%</span>
          </div>
        </div>

        {/* Headline Score Number */}
        <div className="flex flex-col items-center justify-center p-6 bg-bg border border-border rounded-lg min-w-[160px] self-stretch md:self-auto">
          <span className="text-xs font-semibold text-muted uppercase font-heading">
            Headline Score
          </span>
          <span className="text-5xl font-heading font-bold text-accent-warm my-1">
            {report.overallScore}
          </span>
          <span className="text-xs text-muted font-heading font-medium">Out of 100</span>
        </div>
      </div>

      {/* Section 1: Competency Radar Chart & Top Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryRadar categories={report.categories} />

        {/* Top Mentor Recommendations */}
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-soft flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider font-heading">
              Key Actionable Takeaways
            </h3>

            <div className="space-y-3">
              {report.topRecommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-bg border border-border rounded-md text-xs text-ink leading-relaxed flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent-light text-accent font-heading font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>Evaluated by Claude LLM + Speech Audio Profiler</span>
            <Link href="/coach" className="font-semibold text-accent hover:underline">
              Practice weak answers →
            </Link>
          </div>
        </div>
      </div>

      {/* Section 2: Detailed Per-Question Breakdown */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">
          Per-Question Answer Breakdown
        </h2>

        <QuestionBreakdown questions={report.questions} />
      </section>
    </div>
  );
}
