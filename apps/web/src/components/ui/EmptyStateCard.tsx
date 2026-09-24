'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  className,
}: EmptyStateCardProps) {
  return (
    <div
      className={clsx(
        'bg-surface border border-border rounded-card p-8 sm:p-12 text-center shadow-card flex flex-col items-center justify-center max-w-xl mx-auto my-6',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-accent-soft text-accent flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="font-heading font-bold text-lg sm:text-xl text-ink mb-1.5">{title}</h3>
      <p className="text-muted text-sm leading-relaxed max-w-md mb-6">{description}</p>

      {ctaLabel && (
        <div>
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-pill bg-accent hover:bg-accent-hover text-surface font-semibold text-sm transition-all duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-accent"
            >
              {ctaLabel}
            </Link>
          ) : (
            <button
              onClick={onCtaClick}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-pill bg-accent hover:bg-accent-hover text-surface font-semibold text-sm transition-all duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-accent"
            >
              {ctaLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
