'use client';

import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('Alex Chen');
  const [email, setEmail] = useState('alex.chen@example.com');
  const [captions, setCaptions] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
          Settings
        </h1>
        <p className="text-muted text-sm mt-1">
          Manage your profile, audio defaults, and account preferences.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-6 bg-surface border border-border rounded-lg p-6">
        <div className="space-y-4">
          <h2 className="text-sm font-heading font-bold text-ink border-b border-border pb-2">
            Profile Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase font-heading mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase font-heading mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-heading font-bold text-ink border-b border-border pb-2">
            Interview Environment Defaults
          </h2>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="font-heading font-semibold text-ink text-sm block">Live Captions</span>
              <span className="text-xs text-muted">Show real-time speech-to-text captions during interviewer turns.</span>
            </div>
            <input
              type="checkbox"
              checked={captions}
              onChange={(e) => setCaptions(e.target.checked)}
              className="w-4 h-4 text-accent accent-accent rounded focus:ring-accent"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-surface text-sm font-medium transition-colors"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Save changes' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
