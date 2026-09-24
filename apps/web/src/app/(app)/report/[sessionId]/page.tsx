'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Award, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { useAppStore } from '../../../../store/session.store';
import { CategoryRadar } from '../../../../components/report/CategoryRadar';
import { QuestionBreakdown } from '../../../../components/report/QuestionBreakdown';
import { ProgressRing } from '../../../../components/ui/ProgressRing';
import { PillTag } from '../../../../components/ui/PillTag';

export default function ReportPage() {
  const { report, jobAnalysis } = useAppStore();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl pb-8">
      {/* Header */}
      <header className="border-b border-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink tracking-tight">
            Interview Performance Report
          </h1>
          <p className="text-muted text-sm sm:text-base mt-1">
            Session evaluation for <span className="text-ink font-semibold">{jobAnalysis.jobTitle}</span> at{' '}
            <span className="text-ink font-semibold">{jobAnalysis.company}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-pill bg-accent hover:bg-accent-hover text-surface font-semibold text-sm transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-accent"
          >
            Comm Coach Rewrites
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Top Banner: Hero Score Ring & Verdict */}
      <div className="bg-surface border border-border rounded-card p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3.5 max-w-xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <PillTag label="Overall Verdict" variant="accent" />
            <PillTag label={report.verdict} variant="success" icon={CheckCircle2} />
          </div>

          <h2 className="text-xl sm:text-2xl font-heading font-bold text-ink leading-snug">
            "{report.summaryLine}"
          </h2>

          <div className="flex items-center gap-2.5 flex-wrap pt-1">
            <PillTag label={`WPM: ${report.metrics.wordsPerMinute}`} variant="muted" />
            <PillTag label={`Fillers: ${report.metrics.fillerCount}`} variant="muted" />
            <PillTag label={`Face Visible: ${report.metrics.faceVisiblePct}%`} variant="muted" />
          </div>
        </div>

        {/* Hero Score Ring Moment */}
        <div className="flex flex-col items-center justify-center p-6 bg-accent-soft/40 border border-accent/15 rounded-card min-w-[180px] self-stretch md:self-auto shadow-sm">
          <ProgressRing
            score={report.overallScore}
            size={120}
            strokeWidth={12}
            variant="accent"
            sublabel="Hero Score"
          />
        </div>
      </div>

      {/* Competency Breakdown & Key Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryRadar categories={report.categories} />

        {/* Key Actionable Takeaways */}
        <div className="bg-surface border border-border rounded-card p-6 space-y-4 shadow-card flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-heading text-muted uppercase tracking-wider">
                Key Actionable Takeaways
              </h3>
              <PillTag label="AI Feedback" variant="accent" icon={Zap} />
            </div>

            <div className="space-y-3">
              {report.topRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-bg border border-border/70 rounded-btn text-xs sm:text-sm text-ink leading-relaxed flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-accent text-surface font-heading font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>Evaluated by LLM + Speech Profiler</span>
            <Link href="/coach" className="font-semibold text-accent hover:underline">
              Practice weak areas →
            </Link>
          </div>
        </div>
      </div>

      {/* Per-Question Answer Breakdown */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">Per-Question Breakdown</h2>
        <QuestionBreakdown questions={report.questions} />
      </section>
    </div>
  );
}
