'use client';

import React from 'react';
import { Camera, User, Mic } from 'lucide-react';
import { clsx } from 'clsx';

interface CandidateCameraProps {
  isCandidateSpeaking: boolean;
  isFaceDetected: boolean;
}

export function CandidateCamera({ isCandidateSpeaking, isFaceDetected }: CandidateCameraProps) {
  return (
    <div className="relative aspect-video w-full bg-ink rounded-lg overflow-hidden border border-border shadow-sm flex items-center justify-center group">
      {/* Fallback Face Representation */}
      <div className="flex flex-col items-center justify-center text-muted space-y-1">
        <div className="w-12 h-12 rounded-full bg-surface/10 border border-surface/20 flex items-center justify-center text-surface">
          <User className="w-6 h-6 text-muted" />
        </div>
        <span className="text-[10px] text-muted font-body">Candidate Feed (Local)</span>
      </div>

      {/* Mic Status Indicator */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface/80 text-ink text-[10px] font-heading font-semibold flex items-center gap-1">
        <Mic className={clsx('w-3 h-3', isCandidateSpeaking ? 'text-accent' : 'text-muted')} />
        {isCandidateSpeaking ? 'Mic Active' : 'Muted'}
      </div>

      {/* Face Status Pill */}
      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-surface/80 text-[10px] font-heading font-semibold text-ink flex items-center gap-1">
        <span className={clsx('w-1.5 h-1.5 rounded-full', isFaceDetected ? 'bg-accent' : 'bg-severity-weak')} />
        {isFaceDetected ? 'Face Detected' : 'No Face'}
      </div>
    </div>
  );
}
