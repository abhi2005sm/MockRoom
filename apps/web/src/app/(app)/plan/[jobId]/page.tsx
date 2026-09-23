'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, HelpCircle, Layers, Settings2, Play } from 'lucide-react';
import { useAppStore } from '../../../../store/session.store';
import { ModeSelector } from '../../../../components/plan/ModeSelector';
import { PersonaSelector } from '../../../../components/plan/PersonaSelector';

export default function InterviewPlanPage() {
  const router = useRouter();
  const { plan, activeModeId, activePersona, setMode, setPersona, startLiveSession } = useAppStore();

  const handleStart = () => {
    startLiveSession();
    router.push('/device-check/sess-892');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <header className="border-b border-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Interview Plan
          </h1>
          <p className="text-muted text-sm sm:text-base mt-1">
            Customize mode rules and interviewer persona for <span className="text-ink font-medium">{plan.jobTitle}</span>.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent hover:bg-accent-hover text-surface font-medium text-sm transition-colors self-start md:self-auto focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Play className="w-4 h-4 fill-current" />
          Proceed to device check
        </button>
      </header>

      {/* Plan Summary Stats Bar */}
      <div className="bg-surface border border-border rounded-lg p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="block text-xs text-muted font-heading uppercase">Duration</span>
          <span className="font-heading font-bold text-ink text-base">{plan.durationMinutes} minutes</span>
        </div>

        <div>
          <span className="block text-xs text-muted font-heading uppercase">Question Budget</span>
          <span className="font-heading font-bold text-ink text-base">{plan.totalQuestions} questions</span>
        </div>

        <div>
          <span className="block text-xs text-muted font-heading uppercase">Rounds</span>
          <span className="font-heading font-bold text-ink text-base">{plan.rounds.length} structured rounds</span>
        </div>

        <div>
          <span className="block text-xs text-muted font-heading uppercase">Active Persona</span>
          <span className="font-heading font-bold text-accent text-base">{activePersona.name}</span>
        </div>
      </div>

      {/* Section 1: Mode Picker & Confidence Staircase */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">
          1. Select Interview Mode
        </h2>
        <ModeSelector activeModeId={plan.mode} onSelectMode={setMode} />
      </section>

      {/* Section 2: Persona Picker */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">
          2. Choose Interviewer Persona
        </h2>
        <PersonaSelector activePersonaId={plan.personaId} onSelectPersona={setPersona} />
      </section>

      {/* Section 3: Detailed Round Breakdown */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">
          3. Interview Round Structure
        </h2>

        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {plan.rounds.map((round, idx) => (
            <div key={round.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-bg text-muted font-heading text-xs font-bold flex items-center justify-center border border-border">
                    {idx + 1}
                  </span>
                  <h3 className="font-heading font-bold text-ink text-base">
                    {round.name}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {round.topics.map((topic, tidx) => (
                    <span key={tidx} className="px-2 py-0.5 rounded-sm bg-bg border border-border text-xs text-muted">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted font-heading self-end sm:self-center">
                <span>{round.questionCount} question{round.questionCount > 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{round.durationMinutes} mins</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
