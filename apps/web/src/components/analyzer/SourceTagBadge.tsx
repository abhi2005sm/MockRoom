import React from 'react';
import { SourceType } from '../../lib/shared/types';
import { ShieldCheck, Globe, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface SourceTagBadgeProps {
  type: SourceType;
  className?: string;
}

export function SourceTagBadge({ type, className }: SourceTagBadgeProps) {
  const config = {
    verified: {
      label: 'Verified',
      icon: ShieldCheck,
      bg: 'bg-accent-light',
      text: 'text-accent',
      border: 'border-accent/30',
      title: 'Extracted directly from job description or resume text.',
    },
    reported: {
      label: 'From public sources',
      icon: Globe,
      bg: 'bg-accent-warm-light',
      text: 'text-accent-warm',
      border: 'border-accent-warm/30',
      title: 'Reported from public company interview reviews.',
    },
    inferred: {
      label: 'AI-inferred',
      icon: Sparkles,
      bg: 'bg-bg',
      text: 'text-muted',
      border: 'border-border',
      title: 'Inferred by AI based on industry standards for this role.',
    },
  };

  const item = config[type] || config.inferred;
  const Icon = item.icon;

  return (
    <span
      title={item.title}
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[11px] font-medium font-body transition-colors',
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      {item.label}
    </span>
  );
}
