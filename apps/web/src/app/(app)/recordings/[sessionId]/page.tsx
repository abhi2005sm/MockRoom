'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../../../store/session.store';
import { TranscriptTimeline } from '../../../../components/recordings/TranscriptTimeline';
import { ReplayPlayer } from '../../../../components/recordings/ReplayPlayer';
import { Video, Calendar, Clock, Download } from 'lucide-react';

export default function RecordingsPage() {
  const { liveSession, coachingSections, jobAnalysis } = useAppStore();
  const [activeTurnId, setActiveTurnId] = useState<string | null>(liveSession.turns[0]?.id || null);
  const [seekMs, setSeekMs] = useState<number>(0);

  const handleSelectTimestamp = (turnId: string, ms: number) => {
    setActiveTurnId(turnId);
    setSeekMs(ms);
  };

  const activeTurn = liveSession.turns.find((t) => t.id === activeTurnId);
  const linkedCoachingCard = activeTurn?.questionId
    ? coachingSections.find((c) => c.questionId === activeTurn.questionId)
    : undefined;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <header className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Session Recording & Replay
          </h1>
          <p className="text-muted text-sm sm:text-base mt-1">
            <span className="text-ink font-medium">{jobAnalysis.jobTitle}</span> interview transcript replay with synchronized timestamp seeking.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-surface border border-border hover:bg-bg text-ink font-medium text-xs sm:text-sm transition-colors">
          <Download className="w-4 h-4 text-muted" />
          Export transcript (.json)
        </button>
      </header>

      {/* Main Grid: Replay Player (Left) + Transcript Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ReplayPlayer seekMs={seekMs} linkedCoachingCard={linkedCoachingCard} />

        <TranscriptTimeline
          turns={liveSession.turns}
          activeTurnId={activeTurnId}
          coachingSections={coachingSections}
          onSelectTimestamp={handleSelectTimestamp}
        />
      </div>
    </div>
  );
}
