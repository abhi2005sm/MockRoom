'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  suffix?: string;
  iconBgColor?: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  suffix,
  iconBgColor = 'bg-accent-soft text-accent',
  className,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        'bg-surface border border-border rounded-card p-5 shadow-card flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', iconBgColor)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-semibold',
              trend.positive ? 'bg-success-tint text-success' : 'bg-warning-tint text-warning'
            )}
          >
            {trend.positive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span className="font-heading font-bold text-3xl sm:text-4xl text-ink tracking-tight">
            {value}
          </span>
          {suffix && <span className="text-sm font-medium text-muted">{suffix}</span>}
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted mt-1">{label}</p>
      </div>
    </div>
  );
}
