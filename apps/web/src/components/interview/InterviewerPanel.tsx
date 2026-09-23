'use client';

import React from 'react';
import { Persona } from '../../lib/shared/types';
import { Volume2, VolumeX, Mic } from 'lucide-react';
import { clsx } from 'clsx';

interface InterviewerPanelProps {
  persona: Persona;
  isSpeaking: boolean;
  isAudioStreaming: boolean;
}

export function InterviewerPanel({ persona, isSpeaking, isAudioStreaming }: InterviewerPanelProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-5 shadow-soft relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[260px]">
      {/* Background Subtle Wave Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/30 to-surface pointer-events-none" />

      {/* Avatar Container */}
      <div className="relative">
        <div className={clsx(
          'w-24 h-24 rounded-full bg-accent-light text-accent flex items-center justify-center font-heading font-bold text-2xl border-2 transition-all duration-300',
          isSpeaking ? 'border-accent ring-4 ring-accent/20 scale-105' : 'border-border'
        )}>
          {persona.name.split(' ').map((n) => n[0]).join('')}
        </div>

        {/* Live Audio Indicator Pill */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-surface border border-border text-[10px] font-heading font-bold flex items-center gap-1.5 shadow-sm text-ink">
          <span className={clsx('w-2 h-2 rounded-full', isSpeaking ? 'bg-accent animate-ping' : 'bg-muted')} />
          {isSpeaking ? 'Speaking' : 'Listening'}
        </div>
      </div>

      {/* Persona Info */}
      <div className="space-y-1 relative z-10">
        <h3 className="font-heading font-bold text-ink text-lg">
          {persona.name}
        </h3>
        <p className="text-xs text-muted font-medium">
          {persona.title} • <span className="text-ink">{persona.companyStyle}</span>
        </p>
      </div>

      {/* Dynamic Animated Voice Waveform Bars */}
      <div className="flex items-center justify-center gap-1 h-8 w-48 py-1">
        {[40, 75, 100, 60, 90, 45, 80, 55, 95, 50, 70, 30].map((height, i) => (
          <span
            key={i}
            className={clsx(
              'w-1 rounded-full transition-all duration-150',
              isSpeaking ? 'bg-accent' : 'bg-border'
            )}
            style={{
              height: isSpeaking ? `${Math.max(20, Math.sin(Date.now() / 200 + i) * height)}%` : '20%',
            }}
          />
        ))}
      </div>
    </div>
  );
}
