'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Mic,
  Code2,
  MessageSquareQuote,
  UserCheck,
  BarChart3,
  BookMarked,
  RotateCcw,
  Video,
  Library,
  Settings,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/session.store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const coachingSections = useAppStore((state) => state.coachingSections);
  const unpracticedCount = coachingSections.filter((s) => !s.practiced).length;

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'Prepare',
      items: [
        { label: 'Target Role', href: '/target-role', icon: Target },
        { label: 'Job Analyzer', href: '/analyzer/job-101', icon: Briefcase },
        { label: 'Interview Plan', href: '/plan/job-101', icon: CalendarDays },
      ],
    },
    {
      title: 'Practice',
      items: [
        { label: 'Device Check', href: '/device-check/sess-892', icon: CheckCircle2 },
        { label: 'Mock Interview', href: '/interview/sess-892', icon: Mic },
        { label: 'Coding Lab', href: '/coding-lab', icon: Code2 },
      ],
    },
    {
      title: 'Improve',
      items: [
        {
          label: 'Comm Coach',
          href: '/coach',
          icon: MessageSquareQuote,
          badge: unpracticedCount > 0 ? unpracticedCount : undefined,
        },
        { label: 'Self-Intro', href: '/coach/self-introduction', icon: UserCheck },
      ],
    },
    {
      title: 'Track',
      items: [
        { label: 'Performance', href: '/performance', icon: BarChart3 },
        { label: 'Weak Areas', href: '/weak-areas', icon: BookMarked },
        { label: 'Retry Mistakes', href: '/retry-mistakes', icon: RotateCcw },
        { label: 'Recordings', href: '/recordings/sess-892', icon: Video },
        { label: 'Answer Library', href: '/answer-library', icon: Library },
      ],
    },
  ];

  const settingsItem: NavItem = {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  };

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true;
    if (href === '/coach') return pathname === '/coach';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Drawer Trigger (under 640px) */}
      <div className="sm:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-surface border border-border rounded-xl shadow-card text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-ink/20 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={clsx(
          'fixed sm:sticky top-0 left-0 h-screen z-40 bg-surface border-r border-border flex flex-col transition-all duration-200 ease-in-out',
          'w-64 lg:w-64 md:w-20 sm:w-20',
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full sm:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-surface font-heading font-bold text-lg shadow-sm">
              M
            </div>
            <div className="hidden lg:block">
              <span className="font-heading font-bold text-ink text-lg tracking-tight block">
                MockRoom
              </span>
              <span className="block text-[11px] text-muted font-medium -mt-1">
                Interview Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Grouped Navigation Item List */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {navGroups.map((group, groupIdx) => (
            <div key={group.title} className={groupIdx > 0 ? 'pt-1' : ''}>
              {/* Group Section Label (11px, --muted, normal case, not caps-lock) */}
              <div className="text-[11px] font-medium text-muted px-3 mb-1.5 hidden lg:block">
                {group.title}
              </div>
              {/* Gap placeholder on collapsed sidebar (<1024px) */}
              <div className="h-2 block lg:hidden" />

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={item.label}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group duration-150',
                        active
                          ? 'bg-accent-soft text-ink font-semibold'
                          : 'text-muted hover:text-ink hover:bg-bg'
                      )}
                    >
                      <Icon
                        className={clsx(
                          'w-4 h-4 flex-shrink-0 transition-colors',
                          active ? 'text-accent' : 'text-muted group-hover:text-ink'
                        )}
                      />

                      <span className="truncate hidden lg:block">{item.label}</span>

                      {item.badge !== undefined && (
                        <span className="ml-auto hidden lg:flex items-center justify-center h-4 min-w-4 px-1.5 text-[10px] font-extrabold rounded-pill bg-accent text-surface shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pinned Settings & User Profile below Hairline Divider */}
        <div className="p-3 border-t border-border bg-surface flex-shrink-0 space-y-1">
          {(() => {
            const active = isActive(settingsItem.href);
            const Icon = settingsItem.icon;
            return (
              <Link
                href={settingsItem.href}
                onClick={() => setMobileOpen(false)}
                title={settingsItem.label}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group duration-150',
                  active
                    ? 'bg-accent-soft text-ink font-semibold'
                    : 'text-muted hover:text-ink hover:bg-bg'
                )}
              >
                <Icon
                  className={clsx(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    active ? 'text-accent' : 'text-muted group-hover:text-ink'
                  )}
                />
                <span className="truncate hidden lg:block">{settingsItem.label}</span>
              </Link>
            );
          })()}

          {/* Compact User snippet on desktop */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg bg-bg/60 border border-border/50">
            <div className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center font-heading text-xs font-bold flex-shrink-0">
              AC
            </div>
            <div className="truncate text-xs min-w-0">
              <p className="font-semibold text-ink truncate leading-tight">Alex Chen</p>
              <p className="text-muted text-[10px] truncate">Senior Frontend Eng</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
