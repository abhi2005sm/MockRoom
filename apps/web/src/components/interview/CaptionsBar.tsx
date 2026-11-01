'use client';

import React from 'react';

interface CaptionsBarProps {
  captionText: string;
  speakerName: string;
  roundName?: string;
}

export function CaptionsBar({ captionText, speakerName, roundName }: CaptionsBarProps) {
  return (
    <div className="rounded-lg bg-black/70 backdrop-blur-sm px-4 py-3 text-left">
      <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">
        {speakerName}
        {roundName ? ` · ${roundName}` : ''}
      </p>
      <p className="text-sm sm:text-base font-medium text-white leading-relaxed">{captionText}</p>
    </div>
  );
}
