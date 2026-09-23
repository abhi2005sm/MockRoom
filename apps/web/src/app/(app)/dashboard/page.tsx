'use client';

import React from 'react';
import Link from 'next/link';
import { Play, ArrowRight, MessageSquare, Award, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../../store/session.store';

export default function DashboardPage() {
  const { jobAnalysis, report, coachingSections } = useAppStore();
  const topCoachSection = coachingSections[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section with calm summary line */}
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
          Welcome back, Alex
        </h1>
        <p className="text-muted text-sm sm:text-base mt-1">
          Your preparation for <span className="text-ink font-medium">{jobAnalysis.jobTitle}</span> at {jobAnalysis.company} is 78% complete.
        </p>
      </header>

      {/* Primary Next Action Card (Hero) */}
      <section className="bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-accent-light text-accent text-xs font-semibold font-heading uppercase tracking-wider">
            Recommended Action
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-ink">
            Continue your plan for {jobAnalysis.jobTitle}
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            Your next session is a 45-minute <span className="text-ink font-medium">Realistic Mode</span> simulation focusing on React architecture and STAR behavioral responses.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Link
            href="/device-check/sess-892"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-accent hover:bg-accent-hover text-surface font-medium text-sm transition-colors focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Play className="w-4 h-4 fill-current" />
            Start interview
          </Link>
          <Link
            href="/plan/job-101"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md border border-border hover:bg-bg text-ink font-medium text-sm transition-colors"
          >
            Review plan
          </Link>
        </div>
      </section>

      {/* Inline Session Headline Score & Communication Coach Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Headline Score */}
        <section className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading">
              Recent Session Score
            </span>
            <span className="text-xs font-medium text-muted">22 Sep 2026</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-heading font-bold text-accent-warm">
              {report.overallScore}
            </span>
            <span className="text-sm font-medium text-muted">/ 100</span>
            <span className="ml-auto px-2.5 py-0.5 rounded-sm bg-accent-warm-light text-accent-warm font-heading font-bold text-xs">
              {report.verdict}
            </span>
          </div>

          <p className="text-sm text-ink leading-relaxed">
            {report.summaryLine}
          </p>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted">Highest score: Technical (84)</span>
            <Link
              href="/report/sess-892"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              View full report
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Communication Coach Inline Recommendation */}
        <section className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading">
              Coach Recommendation
            </span>
            <span className="text-xs font-medium text-accent font-heading">Self-Introduction</span>
          </div>

          <p className="text-xs text-muted line-clamp-2 italic border-l-2 border-accent-warm pl-3">
            "{topCoachSection?.originalText}"
          </p>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-ink">Suggested Refinement:</p>
            <p className="text-xs text-muted leading-relaxed line-clamp-2">
              {topCoachSection?.rewrittenText}
            </p>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted">1 unpracticed rewrite</span>
            <Link
              href="/coach"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              Practice this version
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* Recent Activity List (simple list, not cards-of-cards) */}
      <section className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-heading font-bold text-ink">Recent Activity</h2>
        <div className="divide-y divide-border">
          <div className="py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <div>
                <p className="font-medium text-ink">Completed Realistic Mode Session</p>
                <p className="text-xs text-muted">Senior Frontend Engineer — 6 questions answered</p>
              </div>
            </div>
            <span className="text-xs text-muted">Yesterday</span>
          </div>

          <div className="py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-accent-warm" />
              <div>
                <p className="font-medium text-ink">Practiced STAR Behavioral Rewrite</p>
                <p className="text-xs text-muted">Outage resolution response score improved by +14 pts</p>
              </div>
            </div>
            <span className="text-xs text-muted">2 days ago</span>
          </div>

          <div className="py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-accent" />
              <div>
                <p className="font-medium text-ink">Parsed Job Description & Resume</p>
                <p className="text-xs text-muted">Extracted 6 core skills with verified source tags</p>
              </div>
            </div>
            <span className="text-xs text-muted">3 days ago</span>
          </div>
        </div>
      </section>
    </div>
  );
}
