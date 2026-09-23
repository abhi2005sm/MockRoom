'use client';

import React, { useState } from 'react';
import { Search, Library, Tag, Calendar, Copy, Check } from 'lucide-react';
import { useAppStore } from '../../../store/session.store';

export default function AnswerLibraryPage() {
  const { answerLibrary } = useAppStore();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAnswers = answerLibrary.filter(
    (item) =>
      item.questionText.toLowerCase().includes(search.toLowerCase()) ||
      item.answerText.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <header className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Answer Library
          </h1>
          <p className="text-muted text-sm sm:text-base mt-1">
            Searchable repository of every structured answer and refined pitch you've given.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search answers or tags..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-md text-xs text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
      </header>

      {/* Answer Cards List */}
      <div className="space-y-4">
        {filteredAnswers.map((ans) => (
          <div key={ans.id} className="bg-surface border border-border rounded-lg p-6 space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-bg border border-border text-[11px] font-heading font-semibold text-muted">
                  {ans.category}
                </span>
                <span className="text-xs font-bold text-accent-warm font-heading">
                  Score: {ans.score}/100
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted">
                <span>{ans.jobTitle}</span>
                <span>•</span>
                <span>{ans.date}</span>
              </div>
            </div>

            <h3 className="font-heading font-bold text-ink text-base">
              {ans.questionText}
            </h3>

            <p className="text-xs sm:text-sm text-ink leading-relaxed bg-bg p-4 rounded border border-border font-body">
              "{ans.answerText}"
            </p>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {ans.tags.map((tag, tidx) => (
                  <span key={tidx} className="px-2 py-0.5 rounded bg-accent-light text-accent text-[10px] font-heading font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleCopy(ans.id, ans.answerText)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink"
              >
                {copiedId === ans.id ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === ans.id ? 'Copied' : 'Copy answer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
