'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive =
    pathname.startsWith('/interview') || pathname.startsWith('/device-check');

  if (immersive) {
    return (
      <div className="min-h-screen bg-bg text-ink">
        <main className="min-h-screen w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg text-ink">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
