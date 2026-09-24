'use client';

import React from 'react';
import { Persona } from '../../lib/shared/types';
import { clsx } from 'clsx';
import { PillTag } from '../ui/PillTag';

interface InterviewerPanelProps {
  persona: Persona;
  isSpeaking: boolean;
  isAudioStreaming: boolean;
}

export function InterviewerPanel({ persona, isSpeaking }: InterviewerPanelProps) {
  return (
    <div className="bg-surface border border-border rounded-card p-6 shadow-card relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[250px]">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-soft/30 to-surface pointer-events-none" />

      {/* Friendly Circular AI Interviewer Avatar with Pulse Ring */}
      <div className="relative mb-3 z-10">
        {/* Soft Pulse Ring when speaking */}
        {isSpeaking && (
          <div className="absolute -inset-3 rounded-full bg-accent/15 animate-ping" />
        )}
        <div
          className={clsx(
            'w-24 h-24 rounded-full bg-accent text-surface flex items-center justify-center font-heading font-extrabold text-2xl shadow-md border-4 border-surface transition-all duration-300 relative z-10',
            isSpeaking ? 'scale-105 ring-4 ring-accent/20' : 'opacity-95'
          )}
        >
          {persona.name.split(' ').map((n) => n[0]).join('')}
        </div>

        {/* Live Audio Indicator Pill */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
          <PillTag
            label={isSpeaking ? 'Speaking' : 'Listening'}
            variant={isSpeaking ? 'accent' : 'muted'}
          />
        </div>
      </div>

      {/* Persona Info */}
      <div className="space-y-1 relative z-10 mt-2">
        <h3 className="font-heading font-bold text-ink text-lg">{persona.name}</h3>
        <p className="text-xs text-muted font-medium">
          {persona.title} • <span className="text-ink">{persona.companyStyle}</span>
        </p>
      </div>

      {/* Dynamic Animated Voice Waveform Bars */}
      <div className="flex items-center justify-center gap-1.5 h-6 w-44 mt-4 relative z-10">
        {[40, 75, 100, 60, 90, 45, 80, 55, 95, 50, 70, 30].map((h, i) => (
          <span
            key={i}
            className={clsx(
              'w-1 rounded-full transition-all duration-150',
              isSpeaking ? 'bg-accent' : 'bg-border'
            )}
            style={{
              height: isSpeaking ? `${h}%` : '25%',
            }}
          />
        ))}
      </div>
    </div>
  );
}
