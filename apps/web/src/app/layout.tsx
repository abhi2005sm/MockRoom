import React from 'react';
import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MockRoom — AI Mock Interview & Coaching Platform',
  description: 'A calm, competent AI interview trainer that runs realistic mock interviews and coaches candidates by rewriting weak answers into stronger ones.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-ink selection:bg-accent/20">
        {children}
      </body>
    </html>
  );
}
