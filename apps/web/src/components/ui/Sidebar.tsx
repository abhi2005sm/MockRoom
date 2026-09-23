'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  FileText,
  Briefcase,
  Mic,
  Code2,
  MessageSquareQuote,
  UserCheck,
  BarChart3,
  BookMarked,
  RotateCcw,
  Video,
  Library,
  CalendarDays,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/session.store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const coachingSections = useAppStore((state) => state.coachingSections);
  const unpracticedCount = coachingSections.filter((s) => !s.practiced).length;

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Target Role', href: '/target-role', icon: Target },
    { label: 'Job Analyzer', href: '/analyzer/job-101', icon: Briefcase },
    { label: 'Interview Plan', href: '/plan/job-101', icon: CalendarDays },
    { label: 'Device Check', href: '/device-check/sess-892', icon: FileText },
    { label: 'Mock Interview', href: '/interview/sess-892', icon: Mic },
    { label: 'Coding Lab', href: '/coding-lab', icon: Code2 },
    { label: 'Comm Coach', href: '/coach', icon: MessageSquareQuote, badge: unpracticedCount > 0 ? unpracticedCount : undefined },
    { label: 'Self-Intro', href: '/coach/self-introduction', icon: UserCheck },
    { label: 'Performance', href: '/performance', icon: BarChart3 },
    { label: 'Weak Areas', href: '/weak-areas', icon: BookMarked },
    { label: 'Retry Mistakes', href: '/retry-mistakes', icon: RotateCcw },
    { label: 'Recordings', href: '/recordings/sess-892', icon: Video },
    { label: 'Answer Library', href: '/answer-library', icon: Library },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Drawer Trigger (under 640px) */}
      <div className="sm:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-surface border border-border rounded-md shadow-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-ink/30 z-40"
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
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 focus:outline-none">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-surface font-heading font-bold text-lg">
              M
            </div>
            <div className="hidden lg:block md:hidden sm:hidden group-mobile">
              <span className="font-heading font-bold text-ink text-lg tracking-tight">MOCKROOM</span>
              <span className="block text-[10px] text-muted font-medium -mt-1 tracking-wider uppercase">AI Coach</span>
            </div>
          </Link>
        </div>

        {/* Navigation Item List */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group',
                  active ? 'text-ink font-semibold' : 'text-muted hover:text-ink hover:bg-bg/60'
                )}
              >
                {/* Active Indicator Line (filled --accent, not full background block) */}
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-accent rounded-r" />
                )}

                <Icon className={clsx('w-5 h-5 flex-shrink-0 transition-colors', active ? 'text-accent' : 'text-muted group-hover:text-ink')} />

                <span className="truncate hidden lg:block md:hidden sm:hidden group-mobile">
                  {item.label}
                </span>

                {item.badge !== undefined && (
                  <span className="ml-auto hidden lg:flex items-center justify-center h-5 px-1.5 text-xs font-bold font-heading rounded-full bg-accent-warm text-surface">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile / Active Role snippet */}
        <div className="p-3 border-t border-border bg-bg/40 hidden lg:block md:hidden sm:hidden">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-accent-light text-accent flex items-center justify-center font-heading text-xs font-bold">
              AC
            </div>
            <div className="truncate text-xs">
              <p className="font-medium text-ink truncate">Alex Chen</p>
              <p className="text-muted text-[11px] truncate">Senior Frontend Eng</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
