'use client';

import React from 'react';
import Link from 'next/link';
import { BookMarked, Lightbulb, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../../store/session.store';
import { PillTag } from '../../../components/ui/PillTag';
import { EmptyStateCard } from '../../../components/ui/EmptyStateCard';

export default function WeakAreasPage() {
  const { weakAreas } = useAppStore();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl pb-8">
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink tracking-tight">
          Weak Areas Profile
        </h1>
        <p className="text-muted text-sm sm:text-base mt-1">
          Recurring patterns detected across multiple mock interview sessions, grouped by category.
        </p>
      </header>

      {weakAreas.length > 0 ? (
        <div className="space-y-4">
          {weakAreas.map((area) => (
            <div
              key={area.id}
              className="bg-surface border border-border rounded-card p-6 space-y-4 shadow-card"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <PillTag label={area.category} variant="warning" />
                <span className="text-xs text-muted font-medium">
                  Occurred in {area.frequencyCount} past sessions
                </span>
              </div>

              <h3 className="font-heading font-bold text-ink text-base sm:text-lg">
                {area.title}
              </h3>

              <div className="p-4 bg-bg border border-border/70 rounded-btn text-xs sm:text-sm text-ink space-y-1.5">
                <span className="font-heading font-bold text-accent flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  Actionable Recommendation:
                </span>
                <p className="text-muted leading-relaxed">{area.recommendation}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href="/coach"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-accent hover:underline"
                >
                  Practice in Communication Coach
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          icon={BookMarked}
          title="No Weak Areas Detected"
          description="Great job! No recurring weak points have been identified in your latest interview sessions."
          ctaLabel="Run Another Mock Interview"
          ctaHref="/device-check/sess-892"
        />
      )}
    </div>
  );
}
