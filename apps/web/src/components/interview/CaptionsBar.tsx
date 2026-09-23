'use client';

import React from 'react';
import { Quote } from 'lucide-react';

interface CaptionsBarProps {
  captionText: string;
  roundName: string;
}

export function CaptionsBar({ captionText, roundName }: CaptionsBarProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-2 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading flex items-center gap-1.5">
          <Quote className="w-3.5 h-3.5 text-accent" />
          Interviewer Speech Captions
        </span>
        <span className="text-xs font-medium text-accent font-heading px-2 py-0.5 rounded-sm bg-accent-light">
          {roundName}
        </span>
      </div>

      <p className="text-base sm:text-lg font-heading font-medium text-ink leading-relaxed">
        "{captionText}"
      </p>
    </div>
  );
}
