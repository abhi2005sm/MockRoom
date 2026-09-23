'use client';

import React from 'react';
import Link from 'next/link';
import { BookMarked, Lightbulb, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../../../store/session.store';

export default function WeakAreasPage() {
  const { weakAreas } = useAppStore();

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
          Weak Areas Profile
        </h1>
        <p className="text-muted text-sm sm:text-base mt-1">
          Recurring patterns detected across multiple mock interview sessions, grouped by issue category.
        </p>
      </header>

      <div className="space-y-4">
        {weakAreas.map((area) => (
          <div key={area.id} className="bg-surface border border-border rounded-lg p-6 space-y-3 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-accent-warm-light text-accent-warm font-heading font-semibold text-xs uppercase">
                {area.category}
              </span>
              <span className="text-xs text-muted">Occurred in {area.frequencyCount} past sessions</span>
            </div>

            <h3 className="font-heading font-bold text-ink text-base">
              {area.title}
            </h3>

            <div className="p-3 bg-bg border border-border rounded-md text-xs text-ink space-y-1">
              <span className="font-heading font-semibold text-accent flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                Actionable Recommendation:
              </span>
              <p className="text-muted leading-relaxed">{area.recommendation}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/coach"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                Practice in Communication Coach
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
