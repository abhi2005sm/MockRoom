'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export type PillVariant = 'accent' | 'success' | 'warning' | 'muted' | 'outline';

interface PillTagProps {
  label: string;
  variant?: PillVariant;
  icon?: LucideIcon;
  className?: string;
}

export function PillTag({ label, variant = 'accent', icon: Icon, className }: PillTagProps) {
  const variantStyles: Record<PillVariant, string> = {
    accent: 'bg-accent-soft text-accent border border-accent/15',
    success: 'bg-success-tint text-success border border-success/15',
    warning: 'bg-warning-tint text-warning border border-warning/15',
    muted: 'bg-bg text-muted border border-border',
    outline: 'bg-transparent text-ink border border-border',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold tracking-tight transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}
