'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Mic,
  Volume2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Radio,
  AlertCircle,
} from 'lucide-react';
import { useDeviceStore } from '../../../../store/device.store';
import { useAppStore } from '../../../../store/session.store';
import { PillTag } from '../../../../components/ui/PillTag';
import { globalAudioPlayer } from '../../../../lib/audio-player';
import { useFaceDetection } from '../../../../hooks/useFaceDetection';
import { useMicLevel } from '../../../../hooks/useMicLevel';

const TEST_SENTENCE = "I'm ready for my interview.";

export default function DeviceCheckPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const {
    hasCameraPermission,
    hasMicPermission,
    isFaceDetected,
    micLevel,
    speakerTested,
    micSentenceHeard,
    statusMessage,
    setCameraPermission,
    setMicPermission,
    setFaceDetected,
    setMicLevel,
    setSpeakerTested,
    setMicSentenceHeard,
    setStatusMessage,
  } = useDeviceStore();

  const startLiveSession = useAppStore((s) => s.startLiveSession);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [textOnly, setTextOnly] = useState(false);
  const [joining, setJoining] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [listeningSentence, setListeningSentence] = useState(false);

  const { isFaceDetected: liveFace, faceCount } = useFaceDetection(videoRef, {
    lostMs: 800,
    multipleMs: 2000,
  });
  const { level, hasPermission: micOk } = useMicLevel({ enabled: Boolean(stream), stream });

  useEffect(() => {
    setFaceDetected(liveFace && faceCount === 1);
  }, [liveFace, faceCount, setFaceDetected]);

  useEffect(() => {
    setMicLevel(level);
    if (micOk) setMicPermission(true);
  }, [level, micOk, setMicLevel, setMicPermission]);

  useEffect(() => {
    if (textOnly) {
      setStatusMessage('Text-only mode: you can join with captions and typed answers.');
      return;
    }
    if (!hasCameraPermission) {
      setStatusMessage('Allow camera and microphone — same as a real video interview.');
    } else if (faceCount > 1) {
      setStatusMessage('More than one person is in frame. Sit so only you are on camera.');
    } else if (!isFaceDetected) {
      setStatusMessage('We can’t see your face clearly. Move into the frame and check lighting.');
    } else if (!micSentenceHeard) {
      setStatusMessage('Read the test sentence so we can confirm the microphone.');
    } else if (!speakerTested) {
      setStatusMessage('Play the speaker test and confirm you can hear it.');
    } else {
      setStatusMessage('You’re set. Join when you’re ready — the interviewer will greet you on the call.');
    }
  }, [
    textOnly,
    hasCameraPermission,
    faceCount,
    isFaceDetected,
    micSentenceHeard,
    speakerTested,
    setStatusMessage,
  ]);

  const attachStream = async () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const next = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = next;
      setStream(next);
      if (videoRef.current) videoRef.current.srcObject = next;
      setCameraPermission(true);
      setMicPermission(true);
    } catch {
      setStream(null);
      setCameraPermission(false);
      setMicPermission(false);
    }
  };

  useEffect(() => {
    void attachStream();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleSpeakerTest = () => {
    globalAudioPlayer.unlockAudio();
    globalAudioPlayer.speakText('If you can hear this, your speakers are working.');
  };

  const handleListenSentence = () => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setMicSentenceHeard(level > 8);
      setTranscriptPreview(level > 8 ? TEST_SENTENCE : '');
      return;
    }

    setListeningSentence(true);
    setTranscriptPreview('');
    const rec = new SpeechRecognitionClass();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (event: any) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscriptPreview(text.trim());
      if (text.trim().length > 8) setMicSentenceHeard(true);
    };
    rec.onerror = () => {
      setListeningSentence(false);
      if (level > 12) setMicSentenceHeard(true);
    };
    rec.onend = () => setListeningSentence(false);
    try {
      rec.start();
    } catch {
      setListeningSentence(false);
    }
  };

  const handleStartInterview = async () => {
    setJoining(true);
    globalAudioPlayer.unlockAudio();
    const sessionId = await startLiveSession();
    router.push(`/interview/${sessionId}`);
  };

  const cameraOk = textOnly || (hasCameraPermission && isFaceDetected);
  const micReady = textOnly || (hasMicPermission && (micSentenceHeard || micLevel > 12));
  const speakerOk = textOnly || speakerTested;
  const allPassed = cameraOk && micReady && speakerOk;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto px-4 sm:px-8 py-8 pb-8">
      <header className="text-center space-y-2 border-b border-border pb-5">
        <PillTag label="Pre-Interview Setup" variant="accent" className="mx-auto" />
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink tracking-tight">
          Let’s check your camera, mic, and speakers
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
          Same checks you’d do before a real video interview. Face detection stays in this browser. Video is
          not uploaded unless you later opt in to recording.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="relative aspect-video bg-ink rounded-card overflow-hidden border border-border shadow-card flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />

            {!stream && (
              <div className="absolute inset-0 bg-ink/90 flex flex-col items-center justify-center text-surface p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shadow-lg">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-heading font-bold text-lg text-surface">Camera needed</p>
                  <p className="text-xs text-muted max-w-xs mt-1">
                    Allow camera access, or continue in text-only mode.
                  </p>
                </div>
              </div>
            )}

            {isFaceDetected && faceCount === 1 && (
              <div className="absolute inset-6 border-2 border-accent/70 rounded-2xl pointer-events-none flex items-start justify-end p-3">
                <PillTag label="Face in frame" variant="success" icon={CheckCircle2} />
              </div>
            )}
            {faceCount > 1 && (
              <div className="absolute inset-6 border-2 border-amber-400/80 rounded-2xl pointer-events-none flex items-start justify-end p-3">
                <PillTag label="More than one person" variant="warning" icon={AlertCircle} />
              </div>
            )}
          </div>

          <div className="p-4 bg-surface border border-border rounded-card shadow-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${allPassed ? 'bg-success' : 'bg-amber-400'} animate-pulse`}
              />
              <span className="text-sm font-semibold text-ink">{statusMessage}</span>
            </div>
            <button
              onClick={() => void attachStream()}
              className="text-xs text-muted hover:text-accent flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-btn hover:bg-bg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-test
            </button>
          </div>
        </div>

        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-ink">Microphone</h4>
                    <p className="text-[11px] text-muted">
                      {micOk ? 'Input detected' : 'Waiting for permission'}
                    </p>
                  </div>
                </div>
                <PillTag label={micReady ? 'Mic OK' : 'Check mic'} variant={micReady ? 'success' : 'warning'} />
              </div>

              <div className="h-2.5 bg-bg border border-border rounded-pill overflow-hidden p-0.5">
                <div
                  className="h-full bg-accent rounded-pill transition-all duration-75"
                  style={{ width: `${Math.max(4, micLevel)}%` }}
                />
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Test sentence:{' '}
                <span className="text-ink font-medium italic">&quot;{TEST_SENTENCE}&quot;</span>
              </p>
              {transcriptPreview && (
                <p className="text-xs text-ink">Heard: “{transcriptPreview}”</p>
              )}
              <button
                type="button"
                onClick={handleListenSentence}
                className="text-[11px] font-semibold text-accent hover:underline"
              >
                {listeningSentence ? 'Listening…' : 'Read the sentence'}
              </button>
            </div>

            <div className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3">
              <h3 className="text-xs font-bold font-heading text-muted uppercase tracking-wider">
                System Readiness
              </h3>

              <div className="space-y-2.5 text-xs">
                <CheckRow
                  icon={Camera}
                  label="Camera feed"
                  ok={textOnly || hasCameraPermission}
                />
                <CheckRow icon={Radio} label="Audio input" ok={textOnly || hasMicPermission} />
                <div className="flex items-center justify-between p-2 rounded-btn bg-bg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-accent" />
                    <span className="text-ink font-medium">Speakers</span>
                  </div>
                  {speakerTested ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSpeakerTest}
                        className="text-[11px] font-semibold text-accent hover:underline"
                      >
                        Play test
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpeakerTested(true)}
                        className="text-[11px] font-semibold text-ink hover:underline"
                      >
                        I heard it
                      </button>
                    </div>
                  )}
                </div>
                <CheckRow
                  icon={ShieldCheck}
                  label="Local face check"
                  ok={textOnly || isFaceDetected}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleStartInterview}
              disabled={!allPassed || joining}
              className="w-full py-3.5 px-5 rounded-pill bg-accent hover:bg-accent-hover text-surface font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 cursor-pointer"
            >
              {joining ? 'Joining…' : 'Join interview'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setTextOnly(true)}
              className="w-full text-[12px] text-muted hover:text-ink font-medium"
            >
              Continue in text-only mode
            </button>
            <p className="text-[11px] text-muted text-center leading-normal">
              Face detection runs locally. Video is not uploaded unless you opt in to recording later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckRow({
  icon: Icon,
  label,
  ok,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-btn bg-bg border border-border/50">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-accent" />
        <span className="text-ink font-medium">{label}</span>
      </div>
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-success" />
      ) : (
        <AlertCircle className="w-4 h-4 text-amber-500" />
      )}
    </div>
  );
}
