import React from 'react';
import { Sidebar } from '../../components/ui/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-bg text-ink">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
