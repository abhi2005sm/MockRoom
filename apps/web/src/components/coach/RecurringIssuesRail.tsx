'use client';

import React from 'react';
import { WeakAreaItem } from '../../lib/shared/types';
import { Lightbulb, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface RecurringIssuesRailProps {
  weakAreas: WeakAreaItem[];
}

export function RecurringIssuesRail({ weakAreas }: RecurringIssuesRailProps) {
  return (
    <aside className="bg-surface border border-border rounded-lg p-5 space-y-4 shadow-soft">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Lightbulb className="w-4 h-4 text-accent-warm" />
        <h3 className="font-heading font-bold text-ink text-sm">
          Most Repeated Patterns
        </h3>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Gentle reminders based on your recent mock interviews:
      </p>

      <div className="space-y-3">
        {weakAreas.map((item) => (
          <div key={item.id} className="p-3 bg-bg border border-border rounded-md space-y-1 text-xs">
            <span className="font-heading font-semibold text-ink block">
              {item.title}
            </span>
            <p className="text-muted text-[11px] leading-relaxed">
              {item.recommendation}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-border">
        <Link
          href="/weak-areas"
          className="text-xs font-semibold text-accent hover:underline flex items-center justify-between"
        >
          View all weak areas
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
