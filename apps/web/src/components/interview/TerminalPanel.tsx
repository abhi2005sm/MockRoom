'use client';

import React, { useState, useEffect } from 'react';
import { Send, Mic, MicOff, Terminal as TerminalIcon, Volume2 } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { clsx } from 'clsx';

interface TerminalPanelProps {
  onSubmitAnswer: (text: string) => void;
  onAudioChunk?: (base64Chunk: string) => void;
}

export function TerminalPanel({ onSubmitAnswer, onAudioChunk }: TerminalPanelProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');

  const {
    isListening,
    transcript,
    interimTranscript,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecorder({
    onTranscriptChange: (text) => {
      setInput(text);
    },
    onAudioChunk,
  });

  // Sync transcript updates into input box
  useEffect(() => {
    if (transcript || interimTranscript) {
      setInput((transcript + ' ' + interimTranscript).trim());
    }
  }, [transcript, interimTranscript]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setInput('');
      startListening();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    }
    if (!input.trim()) return;
    onSubmitAnswer(input.trim());
    setInput('');
    resetTranscript();
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4 shadow-soft">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading flex items-center gap-1.5">
          <TerminalIcon className="w-3.5 h-3.5 text-accent" />
          Candidate Response Terminal
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted">Response Mode:</span>
          <div className="inline-flex p-0.5 bg-bg border border-border rounded-md">
            <button
              type="button"
              onClick={() => setMode('voice')}
              className={clsx(
                'px-2.5 py-1 text-xs font-heading font-medium rounded flex items-center gap-1 transition-colors',
                mode === 'voice'
                  ? 'bg-accent text-surface shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              <Mic className="w-3 h-3" />
              Speak (Mic)
            </button>
            <button
              type="button"
              onClick={() => setMode('text')}
              className={clsx(
                'px-2.5 py-1 text-xs font-heading font-medium rounded flex items-center gap-1 transition-colors',
                mode === 'text'
                  ? 'bg-accent text-surface shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              <TerminalIcon className="w-3 h-3" />
              Type (Keyboard)
            </button>
          </div>
        </div>
      </div>

      {/* Main Voice Speaking Area */}
      {mode === 'voice' && (
        <div className="bg-bg border border-border rounded-lg p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleListening}
                className={clsx(
                  'w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                  isListening
                    ? 'bg-severity-weak text-surface animate-pulse scale-105 ring-4 ring-severity-weak/30'
                    : 'bg-accent hover:bg-accent-hover text-surface'
                )}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 animate-spin" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>

              <div className="space-y-0.5">
                <span className="text-sm font-semibold font-heading text-ink block">
                  {isListening ? 'Microphone Active — Speak Now' : 'Click Mic to Speak Answer'}
                </span>
                <span className="text-xs text-muted block">
                  {isListening
                    ? 'Transcribing your voice in real-time...'
                    : 'Tap microphone button to answer out loud like a real interview'}
                </span>
              </div>
            </div>

            {isListening && (
              <div className="flex items-center gap-1 text-accent font-mono text-xs animate-pulse bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                <span>RECORDING SPEECH</span>
              </div>
            )}
          </div>

          {voiceError && (
            <p className="text-xs text-severity-weak font-medium">{voiceError}</p>
          )}

          {/* Transcribed Speech Textbox / Live Preview */}
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice... Speak your response naturally.'
                : 'Click the microphone above and speak your answer...'
            }
            className="w-full p-3 bg-surface border border-border rounded-md text-sm text-ink font-body leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-muted">
              {input.length > 0 ? `${input.split(' ').length} words transcribed` : 'No spoken text yet'}
            </span>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="px-5 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-surface font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Send Spoken Answer
            </button>
          </div>
        </div>
      )}

      {/* Fallback Keyboard Mode */}
      {mode === 'text' && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response here..."
            className="flex-1 p-3 bg-bg border border-border rounded-md text-sm text-ink font-body leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-surface font-medium text-sm rounded-md transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-accent self-end h-10"
          >
            <Send className="w-4 h-4" />
            Send answer
          </button>
        </form>
      )}
    </div>
  );
}
