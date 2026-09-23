'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw, CheckCircle2, ArrowRight, Play } from 'lucide-react';
import { useAppStore } from '../../../store/session.store';

export default function RetryMistakesPage() {
  const { retryQueue, removeRetryQuestion } = useAppStore();

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
          Retry Mistakes Practice Queue
        </h1>
        <p className="text-muted text-sm sm:text-base mt-1">
          A targeted practice list of lower-scoring questions from past sessions to re-attempt and master.
        </p>
      </header>

      <div className="space-y-4">
        {retryQueue.length > 0 ? (
          retryQueue.map((item) => (
            <div key={item.id} className="bg-surface border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-heading font-medium text-muted">
                  <span className="text-accent">{item.jobTitle}</span>
                  <span>•</span>
                  <span>{item.round} Round</span>
                  <span>•</span>
                  <span>Asked on {item.dateAsked}</span>
                </div>
                <h3 className="font-heading font-bold text-ink text-base">
                  {item.questionText}
                </h3>
                <span className="inline-block text-xs font-semibold text-accent-warm font-heading">
                  Previous score: {item.previousScore} / 100
                </span>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <button
                  onClick={() => removeRetryQuestion(item.id)}
                  className="px-3 py-2 text-xs font-medium text-muted hover:text-ink border border-border rounded-md hover:bg-bg transition-colors"
                >
                  Mark resolved
                </button>
                <Link
                  href="/device-check/sess-892"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-surface text-xs font-semibold font-heading transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Retry now
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 bg-surface border border-border rounded-lg text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-accent mx-auto" />
            <p className="font-heading font-bold text-ink text-base">
              Retry queue is clear
            </p>
            <p className="text-xs text-muted">
              All lower-scoring questions have been successfully practiced.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
