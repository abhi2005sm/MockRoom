'use client';

import React, { useState } from 'react';
import { Search, Library, Copy, Check } from 'lucide-react';
import { useAppStore } from '../../../store/session.store';
import { PillTag } from '../../../components/ui/PillTag';
import { EmptyStateCard } from '../../../components/ui/EmptyStateCard';

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
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl pb-8">
      <header className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink tracking-tight">
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
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
      </header>

      {/* Answer Cards List */}
      {filteredAnswers.length > 0 ? (
        <div className="space-y-4">
          {filteredAnswers.map((ans) => (
            <div
              key={ans.id}
              className="bg-surface border border-border rounded-card p-6 space-y-4 shadow-card"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <PillTag label={ans.category} variant="accent" />
                  <PillTag label={`Score: ${ans.score}/100`} variant="success" />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{ans.jobTitle}</span>
                  <span>•</span>
                  <span>{ans.date}</span>
                </div>
              </div>

              <h3 className="font-heading font-bold text-ink text-base sm:text-lg">
                {ans.questionText}
              </h3>

              <p className="text-xs sm:text-sm text-ink leading-relaxed bg-bg p-4 rounded-btn border border-border/70 font-body">
                "{ans.answerText}"
              </p>

              <div className="pt-2 border-t border-border flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ans.tags.map((tag, tidx) => (
                    <PillTag key={tidx} label={`#${tag}`} variant="outline" />
                  ))}
                </div>

                <button
                  onClick={() => handleCopy(ans.id, ans.answerText)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent transition-colors"
                >
                  {copiedId === ans.id ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedId === ans.id ? 'Copied to Clipboard' : 'Copy Answer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          icon={Library}
          title="No Answers Found"
          description="Try adjusting your search criteria or complete a mock interview session to build your saved answer library."
          ctaLabel="Start Mock Interview"
          ctaHref="/device-check/sess-892"
        />
      )}
    </div>
  );
}
