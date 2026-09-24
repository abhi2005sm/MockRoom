'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../../../store/session.store';
import { TranscriptTimeline } from '../../../../components/recordings/TranscriptTimeline';
import { ReplayPlayer } from '../../../../components/recordings/ReplayPlayer';
import { Download } from 'lucide-react';
import { PillTag } from '../../../../components/ui/PillTag';

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
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto pb-8">
      {/* Header */}
      <header className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PillTag label="Session Replay" variant="accent" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink tracking-tight">
            Session Recording & Replay
          </h1>
          <p className="text-muted text-sm sm:text-base mt-1">
            <span className="text-ink font-semibold">{jobAnalysis.jobTitle}</span> interview transcript replay with synchronized timestamp seeking.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-surface border border-border hover:bg-bg text-ink font-semibold text-xs sm:text-sm transition-all shadow-xs">
          <Download className="w-4 h-4 text-muted" />
          Export Transcript (.json)
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
