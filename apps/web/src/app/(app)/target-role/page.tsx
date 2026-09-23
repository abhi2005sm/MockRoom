'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Calendar, ArrowRight, Check } from 'lucide-react';
import { useAppStore } from '../../../store/session.store';

export default function TargetRolePage() {
  const router = useRouter();
  const { jobAnalysis, setJobTarget } = useAppStore();

  const [jdText, setJdText] = useState(jobAnalysis.jdText);
  const [jobTitle, setJobTitle] = useState(jobAnalysis.jobTitle);
  const [company, setCompany] = useState(jobAnalysis.company);
  const [experienceLevel, setExperienceLevel] = useState(jobAnalysis.experienceLevel);
  const [resumeName, setResumeName] = useState(jobAnalysis.resumeFileName || 'Alex_Chen_Resume_2026.pdf');
  const [targetDate, setTargetDate] = useState(jobAnalysis.targetInterviewDate || '2026-10-15');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJobTarget(jdText, resumeName, targetDate);
    setSaved(true);
    setTimeout(() => {
      router.push('/analyzer/job-101');
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
          My Target Role
        </h1>
        <p className="text-muted text-sm sm:text-base mt-1">
          Provide the job description and your resume so the AI coach can customize your interview plan and practice questions.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role & Company Quick Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider font-heading mb-1.5">
              Job title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider font-heading mb-1.5">
              Company name
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider font-heading mb-1.5">
              Target interview date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        </div>

        {/* Side-by-side JD paste and Resume upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Paste JD */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider font-heading">
              Paste the job description
            </label>
            <textarea
              rows={12}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste responsibilities, requirements, and tech stack here..."
              className="w-full p-3 bg-surface border border-border rounded-md text-sm text-ink font-body leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-none"
              required
            />
            <p className="text-xs text-muted">
              Tip: Include required frameworks, architecture responsibilities, and behavioral expectations.
            </p>
          </div>

          {/* Right Column: Upload Resume */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider font-heading">
              Upload your resume
            </label>
            <div className="border-2 border-dashed border-border hover:border-accent rounded-md p-6 bg-surface flex flex-col items-center justify-center text-center space-y-3 min-h-[280px]">
              <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-muted">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">
                  {resumeName ? resumeName : 'Click to select or drag PDF/DOCX file'}
                </p>
                <p className="text-xs text-muted mt-1">PDF or DOCX format (Max 10MB)</p>
              </div>
              <label className="inline-flex items-center px-4 py-2 bg-bg hover:bg-border/50 text-ink text-xs font-semibold rounded-md border border-border cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 mr-2 text-muted" />
                Choose resume file
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeName(e.target.files[0].name);
                    }
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-muted">
              Your resume will be parsed to verify stated project experience and skills.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted">
            All data is encrypted and scoped strictly to your account.
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent hover:bg-accent-hover text-surface font-medium text-sm transition-colors focus-visible:ring-2 focus-visible:ring-accent"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Target role saved
              </>
            ) : (
              <>
                Analyze job description
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
