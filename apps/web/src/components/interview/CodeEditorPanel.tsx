'use client';

import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Code2, Check } from 'lucide-react';

interface CodeEditorPanelProps {
  onSubmitCode: (code: string) => void;
  output: { stdout: string; stderr: string; passed: boolean; testCases: { name: string; passed: boolean }[] } | null;
}

const DEFAULT_STARTER_CODE = `import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value change by delayMs.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
`;

export function CodeEditorPanel({ onSubmitCode, output }: CodeEditorPanelProps) {
  const [code, setCode] = useState(DEFAULT_STARTER_CODE);
  const [language, setLanguage] = useState('typescript');

  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-4 shadow-soft">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-accent" />
          <span className="font-heading font-bold text-ink text-sm">
            Live Coding Lab — Custom Hook Exercise
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2.5 py-1 bg-bg border border-border rounded text-xs text-ink font-mono focus:outline-none"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>

          <button
            onClick={() => onSubmitCode(code)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-surface text-xs font-semibold font-heading transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run code & test cases
          </button>
        </div>
      </div>

      {/* Editor Text Area */}
      <div className="relative">
        <textarea
          rows={12}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-4 bg-[#1E1E1E] text-[#D4D4D4] font-mono text-xs leading-relaxed rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          spellCheck={false}
        />
      </div>

      {/* Test Execution Output Results */}
      {output && (
        <div className="bg-bg border border-border rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading">
              Test Case Results
            </span>
            <span className="text-xs font-bold text-accent font-heading flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              4/4 Passed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {output.testCases.map((tc, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-surface border border-border rounded">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-ink font-medium">{tc.name}</span>
              </div>
            ))}
          </div>

          <pre className="p-3 bg-[#1B1D1C] text-[#A9B7C6] font-mono text-[11px] rounded whitespace-pre-wrap">
            {output.stdout}
          </pre>
        </div>
      )}
    </div>
  );
}
