'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play, Square, AlertCircle, Camera, Mic, Volume2 } from 'lucide-react';
import { useAppStore } from '../../../../store/session.store';
import { InterviewerPanel } from '../../../../components/interview/InterviewerPanel';
import { CandidateCamera } from '../../../../components/interview/CandidateCamera';
import { CaptionsBar } from '../../../../components/interview/CaptionsBar';
import { TimerBar } from '../../../../components/interview/TimerBar';
import { WarningBanner } from '../../../../components/interview/WarningBanner';
import { TerminalPanel } from '../../../../components/interview/TerminalPanel';
import { CodeEditorPanel } from '../../../../components/interview/CodeEditorPanel';

export default function LiveInterviewRoomPage() {
  const router = useRouter();
  const {
    liveSession,
    activePersona,
    plan,
    togglePauseSession,
    endLiveSession,
    submitCandidateAnswer,
    triggerWarning,
    clearWarning,
  } = useAppStore();

  const [time, setTime] = useState(liveSession.timeRemainingSeconds);
  const currentRound = plan.rounds[liveSession.currentRoundIndex] || plan.rounds[0];
  const isCodingRound = currentRound?.name.toLowerCase().includes('coding') || liveSession.currentQuestionIndex === 3;

  useEffect(() => {
    if (liveSession.isPaused) return;

    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [liveSession.isPaused]);

  const handleEndSession = () => {
    endLiveSession();
    router.push('/report/sess-892');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Header: Unobtrusive Timer & Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <TimerBar
          timeRemainingSeconds={time}
          currentRoundName={currentRound.name}
          roundIndex={liveSession.currentRoundIndex}
          totalRounds={plan.rounds.length}
          modeName={plan.mode.toUpperCase()}
        />

        {/* Live Controls: Pause / End Session */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => triggerWarning('mic', "We can't hear you — try speaking closer to the mic")}
            className="px-2.5 py-1 bg-surface border border-border text-[11px] font-medium text-muted hover:text-ink rounded"
          >
            Simulate Mic Warning
          </button>
          <button
            onClick={togglePauseSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border hover:bg-bg text-ink text-xs font-semibold font-heading transition-colors"
          >
            {liveSession.isPaused ? <Play className="w-3.5 h-3.5 text-accent fill-current" /> : <Pause className="w-3.5 h-3.5 text-muted" />}
            {liveSession.isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleEndSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-severity-weak/10 hover:bg-severity-weak/20 border border-severity-weak/30 text-severity-weak text-xs font-semibold font-heading transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            End session
          </button>
        </div>
      </div>

      {/* Warning Banner (Amber, calm instruction) */}
      {liveSession.activeWarning && (
        <WarningBanner
          type={liveSession.activeWarning.type}
          message={liveSession.activeWarning.message}
          onDismiss={clearWarning}
        />
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Hero Interviewer Panel & Live Captions */}
        <div className="lg:col-span-2 space-y-6">
          <InterviewerPanel
            persona={activePersona}
            isSpeaking={liveSession.isInterviewerSpeaking}
            isAudioStreaming={liveSession.isAudioStreaming}
          />

          <CaptionsBar
            captionText={liveSession.interviewerCaption}
            roundName={currentRound.name}
          />

          {/* Conditional Input Area: Code Editor Panel during Coding Round, else Terminal Panel */}
          {isCodingRound ? (
            <CodeEditorPanel
              onSubmitCode={(code) => submitCandidateAnswer(code, 'code')}
              output={liveSession.codeOutput}
            />
          ) : (
            <TerminalPanel
              onSubmitAnswer={(text) => submitCandidateAnswer(text, 'text')}
            />
          )}
        </div>

        {/* Right Column: Candidate Feed & Round Progress */}
        <div className="space-y-6">
          {/* Candidate Feed (Unobtrusive PIP) */}
          <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading block">
              Candidate Preview
            </span>
            <CandidateCamera
              isCandidateSpeaking={liveSession.isCandidateSpeaking}
              isFaceDetected={true}
            />
          </div>

          {/* Round Progress Ladder */}
          <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading block">
              Interview Rounds
            </span>

            <div className="space-y-2">
              {plan.rounds.map((r, idx) => {
                const isCurrent = idx === liveSession.currentRoundIndex;
                const isPassed = idx < liveSession.currentRoundIndex;

                return (
                  <div
                    key={r.id}
                    className={`p-2.5 rounded-md border text-xs flex items-center justify-between transition-colors ${
                      isCurrent
                        ? 'bg-accent-light border-accent text-accent font-semibold font-heading'
                        : isPassed
                        ? 'bg-bg border-border text-muted'
                        : 'bg-surface border-border text-ink'
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className="font-heading text-[11px]">{r.durationMinutes}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
