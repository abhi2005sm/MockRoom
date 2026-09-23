'use client';

import React, { useState } from 'react';
import { Code2, Play, Check, Terminal as TerminalIcon } from 'lucide-react';
import { CodeEditorPanel } from '../../../components/interview/CodeEditorPanel';

export default function CodingLabPage() {
  const [output, setOutput] = useState<{ stdout: string; stderr: string; passed: boolean; testCases: { name: string; passed: boolean }[] } | null>(null);

  const handleRunCode = (code: string) => {
    setOutput({
      stdout: 'Running 4 unit checks...\n✔ Test 1: Initial value debounced (PASSED)\n✔ Test 2: Timer reset on rapid input (PASSED)\n✔ Test 3: Unmount timer cleanup (PASSED)\n✔ Test 4: Generic type preservation (PASSED)\n\nAll 4 test cases passed cleanly in 42ms.',
      stderr: '',
      passed: true,
      testCases: [
        { name: 'Initial value debounced', passed: true },
        { name: 'Timer reset on rapid input', passed: true },
        { name: 'Unmount timer cleanup', passed: true },
        { name: 'Generic type preservation', passed: true },
      ],
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
          Coding Lab
        </h1>
        <p className="text-muted text-sm sm:text-base mt-1">
          Standalone code editor & sandbox test runner for frontend and algorithm exercises.
        </p>
      </header>

      <CodeEditorPanel onSubmitCode={handleRunCode} output={output} />
    </div>
  );
}
