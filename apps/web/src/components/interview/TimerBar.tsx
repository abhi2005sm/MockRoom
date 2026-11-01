'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface TimerBarProps {
  timeRemainingSeconds: number;
  currentRoundName: string;
  modeName: string;
  roundIndex?: number;
  totalRounds?: number;
}

export function TimerBar({
  timeRemainingSeconds,
  currentRoundName,
  modeName,
  roundIndex,
  totalRounds,
}: TimerBarProps) {
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const formatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const showStrictClock =
    modeName.toLowerCase().includes('pressure') || modeName.toLowerCase().includes('final');

  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2 bg-black/40 text-white rounded-lg text-xs min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-heading font-bold px-2 py-0.5 rounded bg-white/10 text-[11px] uppercase shrink-0">
          {modeName.replace('_', ' ')}
        </span>
        <span className="truncate text-white/80">{currentRoundName}</span>
        {typeof roundIndex === 'number' && typeof totalRounds === 'number' && (
          <span className="hidden sm:inline text-white/40 shrink-0">
            {roundIndex + 1}/{totalRounds}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 font-heading font-semibold text-white/90 shrink-0">
        <Clock className="w-3.5 h-3.5" />
        <span className={showStrictClock ? 'text-amber-200' : undefined}>{formatted}</span>
      </div>
    </div>
  );
}
