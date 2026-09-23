'use client';

import React from 'react';
import { SectionType } from '../../lib/shared/types';
import { clsx } from 'clsx';

interface SectionTabsProps {
  activeTab: SectionType | 'all';
  onSelectTab: (tab: SectionType | 'all') => void;
  unpracticedCounts: Record<string, number>;
}

export function SectionTabs({ activeTab, onSelectTab, unpracticedCounts }: SectionTabsProps) {
  const tabs: { id: SectionType | 'all'; label: string }[] = [
    { id: 'all', label: 'All Sections' },
    { id: 'intro', label: 'Self-Introduction' },
    { id: 'project', label: 'Project' },
    { id: 'technical', label: 'Technical' },
    { id: 'behavioral', label: 'Behavioral' },
    { id: 'closing', label: 'Closing' },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-px">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = unpracticedCounts[tab.id] || 0;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={clsx(
              'px-4 py-2.5 text-xs sm:text-sm font-heading font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              isActive
                ? 'text-ink border-b-2 border-accent'
                : 'text-muted hover:text-ink'
            )}
          >
            {tab.label}
            {count > 0 && (
              <span className="w-4 h-4 rounded-full bg-accent-warm text-surface font-heading text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
