'use client';

import React from 'react';
import { Persona } from '../../lib/shared/types';
import { clsx } from 'clsx';

interface InterviewerPanelProps {
  persona: Persona;
  isSpeaking: boolean;
  isAudioStreaming: boolean;
}

export function InterviewerPanel({ persona, isSpeaking }: InterviewerPanelProps) {
  return (
    <div className="relative h-full min-h-[280px] sm:min-h-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-950 flex flex-col items-center justify-center text-center">
      <div className="relative mb-4">
        {isSpeaking && (
          <div className="absolute -inset-4 rounded-full bg-sky-400/20 animate-ping" />
        )}
        <div
          className={clsx(
            'w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-sky-600 text-white flex items-center justify-center font-heading font-extrabold text-3xl sm:text-4xl shadow-xl border-4 border-white/10 transition-transform duration-300 relative z-10',
            isSpeaking ? 'scale-105' : 'scale-100'
          )}
        >
          {persona.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
      </div>

      <div className="space-y-1 z-10 px-4">
        <h3 className="font-heading font-bold text-white text-lg sm:text-xl">{persona.name}</h3>
        <p className="text-xs sm:text-sm text-white/70">
          {persona.title}
        </p>
        <p className="text-[11px] text-white/50">{isSpeaking ? 'Speaking' : 'Listening'}</p>
      </div>

      <div className="flex items-center justify-center gap-1.5 h-8 w-48 mt-5 z-10">
        {[40, 75, 100, 60, 90, 45, 80, 55, 95, 50, 70, 30].map((h, i) => (
          <span
            key={i}
            className={clsx('w-1 rounded-full transition-all duration-150', isSpeaking ? 'bg-sky-300' : 'bg-white/20')}
            style={{ height: isSpeaking ? `${h}%` : '20%' }}
          />
        ))}
      </div>
    </div>
  );
}
