'use client';

import React from 'react';
import Link from 'next/link';
import {
  Play,
  Flame,
  Award,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../../../store/session.store';
import { StatCard } from '../../../components/ui/StatCard';
import { ListRowCard } from '../../../components/ui/ListRowCard';
import { PillTag } from '../../../components/ui/PillTag';
import { ProgressRing } from '../../../components/ui/ProgressRing';

export default function DashboardPage() {
  const { jobAnalysis, report, coachingSections } = useAppStore();
  const topCoachSection = coachingSections[0];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-8">
      {/* Header section with clean welcome line */}
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink tracking-tight">
          Welcome back, Alex
        </h1>
        <p className="text-muted text-sm sm:text-base mt-1">
          Your preparation for <span className="text-ink font-semibold">{jobAnalysis.jobTitle}</span> at{' '}
          <span className="text-ink font-semibold">{jobAnalysis.company}</span> is 78% complete.
        </p>
      </header>

      {/* Primary Next Action Card (Visual Lead) */}
      <section className="bg-surface border border-border rounded-card p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2.5 max-w-2xl z-10">
          <PillTag label="Continue Where You Left Off" variant="accent" icon={Sparkles} />
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-ink">
            Continue your plan for {jobAnalysis.jobTitle}
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            Your next session is a 45-minute <span className="text-ink font-semibold">Realistic Mode</span> simulation focusing on React architecture and STAR behavioral responses.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto z-10">
          <Link
            href="/device-check/sess-892"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-pill bg-accent hover:bg-accent-hover text-surface font-semibold text-sm transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Interview
          </Link>
          <Link
            href="/plan/job-101"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-btn border border-border hover:bg-bg text-ink font-medium text-sm transition-colors"
          >
            Review Plan
          </Link>
        </div>
      </section>

      {/* Quick Stats Cards Grid (3 cards per row desktop) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          icon={Award}
          value={report.overallScore}
          suffix="/ 100"
          label="Overall Session Score"
          trend={{ value: '+6 pts vs last week', positive: true }}
          iconBgColor="bg-accent-soft text-accent"
        />
        <StatCard
          icon={CheckCircle2}
          value={8}
          suffix=" sessions"
          label="Mock Interviews Completed"
          trend={{ value: '3 completed this week', positive: true }}
          iconBgColor="bg-success-tint text-success"
        />
        <StatCard
          icon={Flame}
          value="4 Days"
          label="Current Prep Momentum"
          trend={{ value: 'On track for target date', positive: true }}
          iconBgColor="bg-warning-tint text-warning"
        />
      </section>

      {/* Grid: Recent Session Score Progress Ring & Coach Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Session Score with ProgressRing */}
        <section className="bg-surface border border-border rounded-card p-6 shadow-card space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted font-heading uppercase tracking-wider">
              Recent Session Score
            </span>
            <span className="text-xs text-muted">22 Sep 2026</span>
          </div>

          <div className="flex items-center gap-6 my-1">
            <ProgressRing
              score={report.overallScore}
              size={110}
              strokeWidth={10}
              variant="accent"
              sublabel="Score"
            />
            <div className="space-y-1.5 min-w-0 flex-1">
              <PillTag label={report.verdict} variant="success" />
              <p className="text-sm font-medium text-ink leading-snug line-clamp-3">
                "{report.summaryLine}"
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted">Highest axis: Technical (84)</span>
            <Link
              href="/report/sess-892"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              View Full Report
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Communication Coach Inline Recommendation */}
        <section className="bg-surface border border-border rounded-card p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted font-heading uppercase tracking-wider">
              Comm Coach Highlight
            </span>
            <PillTag label="Self-Introduction" variant="accent" />
          </div>

          <div className="space-y-3">
            <p className="text-xs text-muted line-clamp-2 italic border-l-2 border-accent pl-3 py-0.5">
              "{topCoachSection?.originalText}"
            </p>

            <div className="space-y-1 bg-bg p-3 rounded-btn border border-border/60">
              <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" />
                Suggested Refinement
              </p>
              <p className="text-xs text-muted leading-relaxed line-clamp-2">
                {topCoachSection?.rewrittenText}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted">1 unpracticed rewrite remaining</span>
            <Link
              href="/coach"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              Practice This Rewrite
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* Recent Activity Section using ListRowCard */}
      <section className="space-y-3">
        <h2 className="text-lg font-heading font-bold text-ink">Recent Activity</h2>
        <div className="space-y-3">
          <ListRowCard
            icon={CheckCircle2}
            title="Completed Realistic Mode Session"
            metadata="Senior Frontend Engineer — 6 questions answered"
            badge={<PillTag label="Completed" variant="success" />}
            action={<span className="text-xs text-muted">Yesterday</span>}
          />
          <ListRowCard
            icon={MessageSquare}
            title="Practiced STAR Behavioral Rewrite"
            metadata="Outage resolution response score improved by +14 pts"
            badge={<PillTag label="Behavioral" variant="accent" />}
            action={<span className="text-xs text-muted">2 days ago</span>}
          />
          <ListRowCard
            icon={Award}
            title="Parsed Job Description & Resume"
            metadata="Extracted 6 core skills with verified source tags"
            badge={<PillTag label="Verified" variant="outline" />}
            action={<span className="text-xs text-muted">3 days ago</span>}
          />
        </div>
      </section>
    </div>
  );
}
