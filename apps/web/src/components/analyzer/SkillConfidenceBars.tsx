'use client';

import React from 'react';
import { SkillItem } from '../../lib/shared/types';
import { SourceTagBadge } from './SourceTagBadge';

interface SkillConfidenceBarsProps {
  skills: SkillItem[];
}

export function SkillConfidenceBars({ skills }: SkillConfidenceBarsProps) {
  return (
    <div className="space-y-5">
      {skills.map((skill) => (
        <div key={skill.id} className="space-y-1.5 bg-surface p-4 rounded-md border border-border">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-ink text-sm sm:text-base">
                {skill.name}
              </span>
              <span className="text-xs text-muted font-body">({skill.category})</span>
            </div>
            <div className="flex items-center gap-3">
              <SourceTagBadge type={skill.sourceType} />
              <span className="font-heading font-bold text-ink text-sm sm:text-base min-w-[44px] text-right">
                {skill.confidencePct}%
              </span>
            </div>
          </div>

          {/* Clean Progress Track: --accent fill on --border track */}
          <div className="h-2 w-full bg-border/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500 rounded-full"
              style={{ width: `${skill.confidencePct}%` }}
            />
          </div>

          {skill.description && (
            <p className="text-xs text-muted pt-1 leading-relaxed">
              {skill.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
