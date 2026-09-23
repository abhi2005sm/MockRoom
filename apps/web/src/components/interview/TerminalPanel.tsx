'use client';

import React, { useState } from 'react';
import { Send, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalPanelProps {
  onSubmitAnswer: (text: string) => void;
}

export function TerminalPanel({ onSubmitAnswer }: TerminalPanelProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmitAnswer(input);
    setInput('');
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-3 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading flex items-center gap-1.5">
          <TerminalIcon className="w-3.5 h-3.5 text-accent" />
          Candidate Response Terminal
        </span>
        <span className="text-[11px] text-muted">Type or speak your answer</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your response here..."
          className="flex-1 p-3 bg-bg border border-border rounded-md text-sm text-ink font-body leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-none"
        />
        <button
          type="submit"
          className="px-5 bg-accent hover:bg-accent-hover text-surface font-medium text-sm rounded-md transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-accent self-end h-10"
        >
          <Send className="w-4 h-4" />
          Send answer
        </button>
      </form>
    </div>
  );
}
