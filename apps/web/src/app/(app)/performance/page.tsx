'use client';

import React from 'react';
import { BarChart3, TrendingUp, Award, Calendar } from 'lucide-react';
import { useAppStore } from '../../../store/session.store';

export default function PerformancePage() {
  const { report } = useAppStore();

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
          Performance Analytics
        </h1>
        <p className="text-muted text-sm sm:text-base mt-1">
          Historical score trends across category domains and past sessions.
        </p>
      </header>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5 space-y-1">
          <span className="text-xs text-muted font-heading uppercase">Overall Average Score</span>
          <p className="text-3xl font-heading font-bold text-accent">78 / 100</p>
          <span className="text-xs text-muted block">+12% improvement across 4 sessions</span>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 space-y-1">
          <span className="text-xs text-muted font-heading uppercase">Highest Score Category</span>
          <p className="text-3xl font-heading font-bold text-ink">Technical (84)</p>
          <span className="text-xs text-muted block">React diffing & component design</span>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 space-y-1">
          <span className="text-xs text-muted font-heading uppercase">Speech Delivery Pace</span>
          <p className="text-3xl font-heading font-bold text-accent-warm">135 WPM</p>
          <span className="text-xs text-muted block">Optimal cadence for interview clarity</span>
        </div>
      </div>

      {/* Category Breakdown List */}
      <section className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-heading font-bold text-ink">Category Competency Breakdown</h2>
        <div className="space-y-4">
          {report.categories.map((cat) => (
            <div key={cat.name} className="space-y-1.5 border-b border-border/60 pb-3 last:border-0">
              <div className="flex items-center justify-between text-sm">
                <span className="font-heading font-semibold text-ink">{cat.label}</span>
                <span className="font-heading font-bold text-accent">{cat.score}%</span>
              </div>
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${cat.score}%` }} />
              </div>
              <p className="text-xs text-muted">{cat.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
