'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SectionType } from '../../../lib/shared/types';
import { useAppStore } from '../../../store/session.store';
import { SectionTabs } from '../../../components/coach/SectionTabs';
import { CoachingCard } from '../../../components/coach/CoachingCard';
import { RecurringIssuesRail } from '../../../components/coach/RecurringIssuesRail';
import { ArrowRight, UserCheck } from 'lucide-react';

export default function CommunicationCoachPage() {
  const { coachingSections, weakAreas, addPracticeAttempt } = useAppStore();
  const [activeTab, setActiveTab] = useState<SectionType | 'all'>('all');

  const filteredSections = activeTab === 'all'
    ? coachingSections
    : coachingSections.filter((s) => s.sectionType === activeTab);

  const unpracticedCounts: Record<string, number> = {
    intro: coachingSections.filter((s) => s.sectionType === 'intro' && !s.practiced).length,
    project: coachingSections.filter((s) => s.sectionType === 'project' && !s.practiced).length,
    technical: coachingSections.filter((s) => s.sectionType === 'technical' && !s.practiced).length,
    behavioral: coachingSections.filter((s) => s.sectionType === 'behavioral' && !s.practiced).length,
    closing: coachingSections.filter((s) => s.sectionType === 'closing' && !s.practiced).length,
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <header className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Communication Coach
          </h1>
          <p className="text-muted text-sm sm:text-base mt-1">
            "Say it like this" rewrites of weak answers without inventing experience you didn't state.
          </p>
        </div>

        <Link
          href="/coach/self-introduction"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-surface font-medium text-sm transition-colors self-start sm:self-auto"
        >
          <UserCheck className="w-4 h-4" />
          Self-Intro trainer
        </Link>
      </header>

      {/* Primary Navigation Section Tabs */}
      <SectionTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unpracticedCounts={unpracticedCounts}
      />

      {/* Main Content: Coaching Cards + Right Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Coaching Cards */}
        <div className="lg:col-span-2 space-y-6">
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => (
              <CoachingCard
                key={section.id}
                section={section}
                onPractice={(id, text) => addPracticeAttempt(id, text)}
              />
            ))
          ) : (
            <div className="p-8 bg-surface border border-border rounded-lg text-center space-y-2">
              <p className="font-heading font-bold text-ink text-base">
                No coaching cards in this section
              </p>
              <p className="text-xs text-muted">
                Your answers in this category scored well during your recent interview session.
              </p>
            </div>
          )}
        </div>

        {/* Right Rail: Recurring Patterns */}
        <RecurringIssuesRail weakAreas={weakAreas} />
      </div>
    </div>
  );
}
