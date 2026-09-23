'use client';

import React from 'react';
import { Turn, CoachingSection } from '../../lib/shared/types';
import { Clock, MessageSquare, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface TranscriptTimelineProps {
  turns: Turn[];
  activeTurnId: string | null;
  coachingSections: CoachingSection[];
  onSelectTimestamp: (turnId: string, ms: number) => void;
}

export function TranscriptTimeline({
  turns,
  activeTurnId,
  coachingSections,
  onSelectTimestamp,
}: TranscriptTimelineProps) {
  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-4 shadow-soft">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-accent" />
          Interactive Transcript Timeline
        </span>
        <span className="text-[11px] text-muted">Click timestamp to seek playback</span>
      </div>

      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
        {turns.map((turn) => {
          const isActive = activeTurnId === turn.id;
          const isInterviewer = turn.speaker === 'interviewer';
          const coachingLink = turn.questionId
            ? coachingSections.find((c) => c.questionId === turn.questionId)
            : undefined;

          return (
            <div
              key={turn.id}
              onClick={() => onSelectTimestamp(turn.id, turn.startMs)}
              className={clsx(
                'p-3.5 rounded-md border text-xs space-y-1.5 cursor-pointer transition-all',
                isActive
                  ? 'bg-accent-light border-accent ring-1 ring-accent'
                  : 'bg-bg/60 border-border hover:bg-bg'
              )}
            >
              <div className="flex items-center justify-between">
                <span className={clsx('font-heading font-bold text-xs', isInterviewer ? 'text-accent' : 'text-ink')}>
                  {isInterviewer ? 'Interviewer' : 'Candidate'}
                </span>

                <span className="font-mono text-[11px] text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(turn.startMs)}
                </span>
              </div>

              <p className="text-ink font-body leading-relaxed">
                "{turn.text}"
              </p>

              {coachingLink && (
                <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-accent font-heading font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>Linked Communication Coach rewrite available</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
