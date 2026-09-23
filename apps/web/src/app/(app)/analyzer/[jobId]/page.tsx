'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Info, Building2, UserCheck, Calendar } from 'lucide-react';
import { useAppStore } from '../../../../store/session.store';
import { SkillConfidenceBars } from '../../../../components/analyzer/SkillConfidenceBars';
import { SourceTagBadge } from '../../../../components/analyzer/SourceTagBadge';

export default function JobAnalyzerPage() {
  const { jobAnalysis } = useAppStore();

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header with Title and Target Info */}
      <header className="border-b border-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            Job Analyzer Profile
          </h1>
          <p className="text-muted text-sm sm:text-base mt-1">
            Skill requirements extracted from <span className="text-ink font-medium">{jobAnalysis.company}</span> ({jobAnalysis.jobTitle}).
          </p>
        </div>

        <Link
          href={`/plan/${jobAnalysis.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-surface font-medium text-sm transition-colors self-start md:self-auto"
        >
          Customize interview plan
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Target Role Overview Banner */}
      <div className="bg-surface border border-border rounded-lg p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
          <div>
            <span className="block text-xs text-muted font-heading uppercase">Target Company</span>
            <span className="font-medium text-ink">{jobAnalysis.company}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserCheck className="w-4 h-4 text-accent flex-shrink-0" />
          <div>
            <span className="block text-xs text-muted font-heading uppercase">Experience Level</span>
            <span className="font-medium text-ink">{jobAnalysis.experienceLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
          <div>
            <span className="block text-xs text-muted font-heading uppercase">Target Date</span>
            <span className="font-medium text-ink">{jobAnalysis.targetInterviewDate || 'Not set'}</span>
          </div>
        </div>
      </div>

      {/* Hero Section: Skill Confidence Bars */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-ink">
            Skill Confidence Profile
          </h2>
          <span className="text-xs text-muted font-body">
            Based on JD parsing & resume verification
          </span>
        </div>

        <SkillConfidenceBars skills={jobAnalysis.parsedSkills} />
      </section>

      {/* Focus Areas & Likely Questions Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">
          Likely Interview Focus Areas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobAnalysis.focusAreas.map((area, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-lg p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <SourceTagBadge type={area.sourceType} />
                <h3 className="font-heading font-semibold text-ink text-sm leading-snug">
                  {area.area}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {area.rationale}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Source Provenance Trust Callout */}
      <div className="p-4 bg-bg border border-border rounded-md flex items-start gap-3 text-xs text-muted">
        <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-ink font-medium">Source Transparency:</strong> Insights are source-tagged as <span className="text-accent font-medium">Verified</span> (directly from submitted text), <span className="text-accent-warm font-medium font-body">From public sources</span> (public company reviews), or <span className="text-ink font-medium">AI-inferred</span>. We never state "this will be asked" — only "here is what to prepare for."
        </p>
      </div>
    </div>
  );
}
