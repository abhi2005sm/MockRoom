'use client';

import React, { useEffect, useState } from 'react';
import { Send, Keyboard } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { clsx } from 'clsx';

interface TerminalPanelProps {
  onSubmitAnswer: (text: string) => void;
  onAudioChunk?: (base64Chunk: string) => void;
  onBargeIn?: () => void;
  autoListen?: boolean;
  muted?: boolean;
  interviewerSpeaking?: boolean;
}

export function TerminalPanel({
  onSubmitAnswer,
  onAudioChunk,
  onBargeIn,
  autoListen = false,
  muted = false,
  interviewerSpeaking = false,
}: TerminalPanelProps) {
  const [input, setInput] = useState('');
  const [showTyped, setShowTyped] = useState(false);

  const submitSpoken = (text: string) => {
    if (!text.trim()) return;
    onSubmitAnswer(text.trim());
    setInput('');
  };

  const {
    isListening,
    transcript,
    interimTranscript,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecorder({
    onTranscriptChange: (text) => setInput(text),
    onFinalTranscript: (text) => {
      submitSpoken(text);
    },
    onAudioChunk,
    autoSubmitSilenceMs: 2200,
  });

  useEffect(() => {
    if (transcript || interimTranscript) {
      setInput((transcript + ' ' + interimTranscript).trim());
    }
  }, [transcript, interimTranscript]);

  useEffect(() => {
    if (muted || !autoListen) {
      if (isListening) stopListening();
      return;
    }
    if (!isListening) {
      startListening();
    }
  }, [muted, autoListen]);

  useEffect(() => {
    if (isListening && interviewerSpeaking && (transcript || interimTranscript)) {
      onBargeIn?.();
    }
  }, [isListening, interviewerSpeaking, transcript, interimTranscript, onBargeIn]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isListening) stopListening();
    if (!input.trim()) return;
    submitSpoken(input.trim());
    resetTranscript();
  };

  return (
    <div className="h-full flex flex-col gap-2 text-white">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-white/50">
          {muted
            ? 'You are muted'
            : isListening
              ? 'Listening… speak as you would on the call'
              : 'Your turn'}
        </p>
        <button
          type="button"
          onClick={() => setShowTyped((v) => !v)}
          className="inline-flex items-center gap-1 text-[11px] text-white/50 hover:text-white"
        >
          <Keyboard className="w-3 h-3" />
          {showTyped ? 'Hide typed answer' : 'Type instead'}
        </button>
      </div>

      {(showTyped || input) && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 flex-1 min-h-0">
          <textarea
            rows={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type if voice is hard to capture…"
            className="w-full flex-1 min-h-[96px] p-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
          />
          <div className="flex items-center justify-between">
            {voiceError ? (
              <span className="text-[11px] text-amber-200">{voiceError}</span>
            ) : (
              <span className="text-[11px] text-white/40">
                {input ? `${input.split(/\s+/).filter(Boolean).length} words` : ''}
              </span>
            )}
            <button
              type="submit"
              disabled={!input.trim()}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
                input.trim() ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-white/10 text-white/40'
              )}
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
