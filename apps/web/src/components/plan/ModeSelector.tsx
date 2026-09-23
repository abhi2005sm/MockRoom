'use client';

import React from 'react';
import { INTERVIEW_MODES } from '../../lib/shared/constants';
import { ModeConfig, InterviewMode } from '../../lib/shared/types';
import { Check, Shield, Flame, BookOpen, Building, Award } from 'lucide-react';
import { clsx } from 'clsx';

interface ModeSelectorProps {
  activeModeId: InterviewMode;
  onSelectMode: (modeId: InterviewMode) => void;
}

export function ModeSelector({ activeModeId, onSelectMode }: ModeSelectorProps) {
  const getIcon = (id: InterviewMode) => {
    switch (id) {
      case 'practice': return Shield;
      case 'learning': return BookOpen;
      case 'realistic': return Award;
      case 'pressure': return Flame;
      case 'company_sim': return Building;
      case 'final_mock': return Award;
      default: return Shield;
    }
  };

  return (
    <div className="space-y-6">
      {/* 5-Level Confidence Staircase Bar */}
      <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading">
            Suggested Progression Path
          </span>
          <span className="text-xs text-muted">Level 1 → Level 5</span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isCurrent = INTERVIEW_MODES.find((m) => m.id === activeModeId)?.confidenceLevel === lvl;

            return (
              <div
                key={lvl}
                className={clsx(
                  'p-2.5 rounded-md border text-xs font-heading font-semibold transition-all',
                  isCurrent
                    ? 'bg-accent text-surface border-accent shadow-sm'
                    : 'bg-bg text-muted border-border'
                )}
              >
                Level {lvl}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6 Scannable Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTERVIEW_MODES.map((mode) => {
          const isSelected = mode.id === activeModeId;
          const Icon = getIcon(mode.id);

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={clsx(
                'p-5 rounded-lg border text-left transition-all relative flex flex-col justify-between space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                isSelected
                  ? 'bg-surface border-accent ring-1 ring-accent shadow-soft'
                  : 'bg-surface border-border hover:border-accent/50'
              )}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-accent text-surface flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="space-y-2 pr-6">
                <div className="flex items-center gap-2">
                  <Icon className={clsx('w-4 h-4', isSelected ? 'text-accent' : 'text-muted')} />
                  <span className="font-heading font-bold text-ink text-sm sm:text-base">
                    {mode.name}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {mode.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted">
                <span>Think time: {mode.thinkTimeSeconds}s</span>
                <span>Interruption: {mode.interruptFrequency}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
