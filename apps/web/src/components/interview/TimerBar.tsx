'use client';

import React from 'react';
import { Clock, Shield } from 'lucide-react';

interface TimerBarProps {
  timeRemainingSeconds: number;
  currentRoundName: string;
  roundIndex: number;
  totalRounds: number;
  modeName: string;
}

export function TimerBar({ timeRemainingSeconds, currentRoundName, roundIndex, totalRounds, modeName }: TimerBarProps) {
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const formatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 bg-surface border border-border rounded-md text-xs">
      <div className="flex items-center gap-2">
        <span className="font-heading font-bold text-accent px-2 py-0.5 rounded bg-accent-light text-[11px] uppercase">
          {modeName}
        </span>
        <span className="text-muted">•</span>
        <span className="font-medium text-ink">
          Round {roundIndex + 1} of {totalRounds}: <span className="font-semibold">{currentRoundName}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 font-heading font-semibold text-muted">
        <Clock className="w-3.5 h-3.5 text-muted" />
        <span>{formatted} remaining</span>
      </div>
    </div>
  );
}
