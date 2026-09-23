'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, Video, Sparkles } from 'lucide-react';
import { CoachingSection } from '../../lib/shared/types';

interface ReplayPlayerProps {
  seekMs: number;
  linkedCoachingCard?: CoachingSection;
}

export function ReplayPlayer({ seekMs, linkedCoachingCard }: ReplayPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Replay Viewport */}
      <div className="relative aspect-video bg-ink rounded-lg overflow-hidden border border-border shadow-soft flex items-center justify-center">
        <div className="text-center space-y-2 p-6">
          <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent text-accent flex items-center justify-center mx-auto">
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </div>
          <p className="font-heading font-bold text-surface text-base">
            Session Replay ({formatTime(seekMs)})
          </p>
          <p className="text-xs text-muted">
            Audio stream & MediaPipe pose telemetry synchronized.
          </p>
        </div>

        {/* Playback Controls Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-surface/90 border-t border-border p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded bg-accent hover:bg-accent-hover text-surface transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <span className="font-mono text-ink font-medium">{formatTime(seekMs)} / 45:00</span>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted" />
            <span className="text-muted">1.0x Speed</span>
          </div>
        </div>
      </div>

      {/* Linked Coaching Card Overlay (if available for current timestamp) */}
      {linkedCoachingCard && (
        <div className="bg-accent-light border border-accent/40 rounded-lg p-5 space-y-3 animate-fade-in shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider font-heading flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent" />
              Linked Coach Refinement at {formatTime(seekMs)}
            </span>
          </div>

          <p className="text-xs text-ink font-body leading-relaxed">
            <strong className="text-accent font-medium font-heading">Refined Pitch:</strong> "{linkedCoachingCard.rewrittenText}"
          </p>
        </div>
      )}
    </div>
  );
}
