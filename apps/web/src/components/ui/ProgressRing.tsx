'use client';

import React from 'react';
import { clsx } from 'clsx';

interface ProgressRingProps {
  score: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'accent' | 'success' | 'warning';
  sublabel?: string;
  className?: string;
}

export function ProgressRing({
  score,
  max = 100,
  size = 120,
  strokeWidth = 10,
  variant = 'accent',
  sublabel,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(score, 0), max);
  const strokeDashoffset = circumference - (normalizedScore / max) * circumference;

  const colorMap = {
    accent: {
      stroke: 'var(--accent)',
      bg: 'var(--accent-soft)',
      text: 'text-accent',
    },
    success: {
      stroke: 'var(--success)',
      bg: 'var(--success-tint)',
      text: 'text-success',
    },
    warning: {
      stroke: 'var(--warning)',
      bg: 'var(--warning-tint)',
      text: 'text-warning',
    },
  };

  const selectedColor = colorMap[variant];

  return (
    <div className={clsx('relative inline-flex flex-col items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={selectedColor.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Central Score Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
          {score}
        </span>
        {sublabel ? (
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted -mt-0.5">
            {sublabel}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-muted">/ {max}</span>
        )}
      </div>
    </div>
  );
}
