'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Pause, Play, Square, Volume2, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../../../../store/session.store';
import { InterviewerPanel } from '../../../../components/interview/InterviewerPanel';
import { CandidateCamera } from '../../../../components/interview/CandidateCamera';
import { CaptionsBar } from '../../../../components/interview/CaptionsBar';
import { TimerBar } from '../../../../components/interview/TimerBar';
import { WarningBanner } from '../../../../components/interview/WarningBanner';
import { TerminalPanel } from '../../../../components/interview/TerminalPanel';
import { CodeEditorPanel } from '../../../../components/interview/CodeEditorPanel';
import { useRealtimeSocket } from '../../../../hooks/useRealtimeSocket';
import { useMicLevel } from '../../../../hooks/useMicLevel';
import { globalAudioPlayer } from '../../../../lib/audio-player';
import { INTERVIEW_MODES } from '../../../../lib/shared/constants';

const FACE_LOST_MSG = "I can't see you on camera. Please move back into frame.";
const FACE_LOST_SPEECH = "I can't see you on camera right now. Could you move back into frame?";
const MIC_SILENT_MSG = "I can't hear you. Check that your microphone is on.";
const MIC_SILENT_SPEECH =
  "I'm not catching any audio on my side. Could you check that your microphone is unmuted?";
const MULTI_FACE_MSG = 'More than one person is in frame. Please sit so only you are on camera.';

export default function LiveInterviewRoomPage() {
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const {
    liveSession,
    activePersona,
    plan,
    activeModeId,
    togglePauseSession,
    setSessionPaused,
    toggleMicMuted,
    interruptInterviewer,
    endLiveSession,
    submitCandidateAnswer,
    triggerWarning,
    clearWarning,
    setFaceDetected,
  } = useAppStore();

  const {
    sendObjectState,
    sendTerminalSubmit,
    sendAudioChunk,
    sendFaceState,
    sendMicState,
    sendControl,
    sendInterrupt,
    unlockAudioPlayback,
  } = useRealtimeSocket(liveSession.wsToken || 'demo-token', liveSession.id || params.sessionId);

  const [time, setTime] = useState(liveSession.timeRemainingSeconds);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const silentSinceRef = useRef<number | null>(null);
  const micWarnedRef = useRef(false);

  const currentRound = plan.rounds[liveSession.currentRoundIndex] || plan.rounds[0];
  const isCodingRound = currentRound?.name.toLowerCase().includes('coding');
  const mode = INTERVIEW_MODES.find((m) => m.id === activeModeId) || INTERVIEW_MODES[2];
  const candidateTurn =
    !liveSession.isInterviewerSpeaking && !liveSession.isPaused && !liveSession.isMicMuted;

  const { level: micLevel } = useMicLevel({ enabled: candidateTurn });

  useEffect(() => {
    setTime(liveSession.timeRemainingSeconds);
  }, [liveSession.timeRemainingSeconds]);

  useEffect(() => {
    if (liveSession.isPaused) return;
    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [liveSession.isPaused]);

  useEffect(() => {
    if (!candidateTurn) {
      silentSinceRef.current = null;
      if (micWarnedRef.current) {
        micWarnedRef.current = false;
        sendMicState('ok');
        if (liveSession.activeWarning?.type === 'mic' && !liveSession.serverConnected) {
          clearWarning();
        }
      }
      return;
    }

    const loud = micLevel >= 8;
    if (loud) {
      silentSinceRef.current = null;
      if (micWarnedRef.current) {
        micWarnedRef.current = false;
        sendMicState('ok');
        if (!liveSession.serverConnected) clearWarning();
      }
      return;
    }

    if (silentSinceRef.current == null) silentSinceRef.current = Date.now();
    if (Date.now() - silentSinceRef.current >= 6000 && !micWarnedRef.current) {
      micWarnedRef.current = true;
      sendMicState('silent');
      if (!liveSession.serverConnected) {
        triggerWarning('mic', MIC_SILENT_MSG);
        globalAudioPlayer.speakText(MIC_SILENT_SPEECH);
      }
    }
  }, [
    candidateTurn,
    micLevel,
    liveSession.serverConnected,
    liveSession.activeWarning?.type,
    sendMicState,
    triggerWarning,
    clearWarning,
  ]);

  const handleUserAudioUnlock = () => {
    unlockAudioPlayback();
    if (!audioUnlocked) {
      setAudioUnlocked(true);
      if (!liveSession.serverConnected) {
        globalAudioPlayer.speakText(liveSession.interviewerCaption);
      }
    }
  };

  const handleReplayInterviewerSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudioPlayback();
    setAudioUnlocked(true);
    globalAudioPlayer.speakText(liveSession.interviewerCaption);
  };

  const handleEndSession = () => {
    sendControl('end');
    void endLiveSession();
    router.push(`/report/${liveSession.id || 'sess-892'}`);
  };

  const handleAnswerSubmit = (text: string, kind: 'text' | 'code' = 'text') => {
    handleUserAudioUnlock();
    submitCandidateAnswer(text, kind);
    sendTerminalSubmit(text, kind);
  };

  const handleFaceLost = useCallback(() => {
    setFaceDetected(false);
    sendFaceState('lost');
    if (!useAppStore.getState().liveSession.serverConnected) {
      triggerWarning('face', FACE_LOST_MSG);
      setSessionPaused(true, 'face');
      globalAudioPlayer.speakText(FACE_LOST_SPEECH);
    }
  }, [sendFaceState, setFaceDetected, setSessionPaused, triggerWarning]);

  const handleFaceFound = useCallback(() => {
    setFaceDetected(true);
    sendFaceState('found');
    const session = useAppStore.getState().liveSession;
    if (!session.serverConnected) {
      if (session.pauseReason === 'face') setSessionPaused(false);
      if (session.activeWarning?.type === 'face') clearWarning();
    }
  }, [clearWarning, sendFaceState, setFaceDetected, setSessionPaused]);

  const handleMultipleFaces = useCallback(() => {
    sendFaceState('multiple');
    if (!useAppStore.getState().liveSession.serverConnected) {
      triggerWarning('face', MULTI_FACE_MSG);
    }
  }, [sendFaceState, triggerWarning]);

  const handleBargeIn = useCallback(() => {
    interruptInterviewer();
    sendInterrupt();
  }, [interruptInterviewer, sendInterrupt]);

  return (
    <div onClick={handleUserAudioUnlock} className="h-screen flex flex-col bg-slate-950 text-white">
      <header className="shrink-0 px-3 sm:px-5 py-3 flex items-center gap-3">
        <TimerBar
          timeRemainingSeconds={time}
          currentRoundName={currentRound.name}
          roundIndex={liveSession.currentRoundIndex}
          totalRounds={plan.rounds.length}
          modeName={plan.mode.toUpperCase()}
        />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleReplayInterviewerSpeech}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg"
          >
            <Volume2 className="w-3.5 h-3.5" />
            {audioUnlocked ? 'Replay' : 'Join audio'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCaptionsOn((v) => !v);
            }}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg"
          >
            {captionsOn ? 'Captions on' : 'Captions off'}
          </button>
        </div>
      </header>

      {liveSession.activeWarning && (
        <div className="px-3 sm:px-5 pb-2">
          <WarningBanner
            type={liveSession.activeWarning.type}
            message={liveSession.activeWarning.message}
            onDismiss={clearWarning}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 px-3 sm:px-5 pb-3 grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,380px)] gap-3">
        <section className="relative min-h-[320px]">
          <InterviewerPanel
            persona={activePersona}
            isSpeaking={liveSession.isInterviewerSpeaking}
            isAudioStreaming={liveSession.isAudioStreaming}
          />

          {captionsOn && (
            <div className="absolute left-3 right-[7.5rem] sm:right-[11.5rem] bottom-3">
              <CaptionsBar
                captionText={liveSession.interviewerCaption}
                speakerName={activePersona.name}
                roundName={currentRound.name}
              />
            </div>
          )}

          <div className="absolute bottom-3 right-3 w-24 sm:w-40 shadow-2xl rounded-lg overflow-hidden">
            <CandidateCamera
              compact
              isCandidateSpeaking={liveSession.isCandidateSpeaking}
              isMicMuted={liveSession.isMicMuted}
              onFaceLost={handleFaceLost}
              onFaceFound={handleFaceFound}
              onMultipleFaces={handleMultipleFaces}
              onPhoneDetected={() => sendObjectState('phone_detected')}
              onPhoneCleared={() => sendObjectState('phone_cleared')}
            />
          </div>
        </section>

        <aside className="flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0 overflow-auto rounded-xl bg-slate-900 border border-white/10 p-3">
            {isCodingRound ? (
              <CodeEditorPanel
                variant="dark"
                onSubmitCode={(code) => handleAnswerSubmit(code, 'code')}
                output={liveSession.codeOutput}
              />
            ) : (
              <TerminalPanel
                onSubmitAnswer={(text) => handleAnswerSubmit(text, 'text')}
                onAudioChunk={sendAudioChunk}
                onBargeIn={handleBargeIn}
                autoListen={audioUnlocked && !liveSession.isPaused}
                muted={liveSession.isMicMuted}
                interviewerSpeaking={liveSession.isInterviewerSpeaking}
              />
            )}
            {!mode.hintsAllowed && (
              <p className="mt-2 text-[11px] text-white/40">
                This is a live interview. No hints during the call
                {mode.thinkTimeSeconds ? ` · take about ${mode.thinkTimeSeconds}s to think if you need it` : ''}.
              </p>
            )}
          </div>
        </aside>
      </div>

      <footer className="shrink-0 border-t border-white/10 px-4 py-3 flex items-center justify-center gap-3 bg-slate-950">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/50">
          {liveSession.isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          {liveSession.isPaused
            ? 'Paused'
            : liveSession.isInterviewerSpeaking
              ? 'Interviewer speaking'
              : 'Your turn'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMicMuted();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold"
        >
          {liveSession.isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {liveSession.isMicMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const next = !liveSession.isPaused;
            togglePauseSession();
            sendControl(next ? 'pause' : 'resume');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold"
        >
          {liveSession.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {liveSession.isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEndSession();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-sm font-semibold"
        >
          <Square className="w-4 h-4 fill-current" />
          Leave
        </button>
      </footer>
    </div>
  );
}
