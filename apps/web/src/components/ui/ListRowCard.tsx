'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ListRowCardProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  metadata: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function ListRowCard({
  icon: IconOrNode,
  title,
  metadata,
  badge,
  action,
  href,
  onClick,
  className,
}: ListRowCardProps) {
  const renderIcon = () => {
    if (!IconOrNode) return null;
    if (React.isValidElement(IconOrNode)) {
      return IconOrNode;
    }
    const IconComp = IconOrNode as LucideIcon;
    return <IconComp className="w-5 h-5" />;
  };

  const content = (
    <div
      className={clsx(
        'bg-surface border border-border rounded-card p-4 shadow-card flex items-center justify-between gap-4 transition-all duration-150 hover:border-border/80 hover:shadow-panel group',
        href || onClick ? 'cursor-pointer hover:-translate-y-0.5' : '',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {IconOrNode && (
          <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            {renderIcon()}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-heading font-semibold text-sm sm:text-base text-ink truncate group-hover:text-accent transition-colors">
              {title}
            </h4>
            {badge}
          </div>
          <p className="text-xs sm:text-sm text-muted truncate mt-0.5">{metadata}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {action}
        {(href || onClick) && !action && (
          <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
