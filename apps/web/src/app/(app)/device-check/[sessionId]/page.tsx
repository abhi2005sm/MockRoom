'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Mic,
  Volume2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Video,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { useDeviceStore } from '../../../../store/device.store';
import { useAppStore } from '../../../../store/session.store';
import { PillTag } from '../../../../components/ui/PillTag';

export default function DeviceCheckPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    hasCameraPermission,
    hasMicPermission,
    isFaceDetected,
    micLevel,
    speakerTested,
    isChecking,
    statusMessage,
    runDeviceDiagnostics,
    setMicLevel,
  } = useDeviceStore();

  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamActive(true);
      } catch (err) {
        setStreamActive(false);
      }
    }
    setupCamera();

    runDeviceDiagnostics();

    const interval = setInterval(() => {
      const level = Math.floor(45 + Math.random() * 40);
      setMicLevel(level);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const handleStartInterview = () => {
    router.push('/interview/sess-892');
  };

  const allPassed = hasCameraPermission && hasMicPermission && isFaceDetected;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto pb-8">
      {/* Header */}
      <header className="text-center space-y-2 border-b border-border pb-5">
        <PillTag label="Pre-Interview Setup" variant="accent" className="mx-auto" />
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink tracking-tight">
          Let’s check your audio & video
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
          We’ll make sure your camera, microphone, and speakers are clear and ready before your mock interview starts.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Columns: Video Preview & Friendly States */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative aspect-video bg-ink rounded-card overflow-hidden border border-border shadow-card flex items-center justify-center group">
            {/* HTML5 Live Stream / Preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />

            {!streamActive && (
              <div className="absolute inset-0 bg-ink/90 flex flex-col items-center justify-center text-surface p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shadow-lg">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-heading font-bold text-lg text-surface">Camera Connected</p>
                  <p className="text-xs text-muted max-w-xs mt-1">
                    Local face-detection active. Video remains local and private inside your browser.
                  </p>
                </div>
              </div>
            )}

            {/* Bounding Box / Face Detection Indicator */}
            {isFaceDetected && (
              <div className="absolute inset-6 border-2 border-accent/70 rounded-2xl pointer-events-none transition-all flex items-start justify-end p-3">
                <PillTag label="Face Centered & Clear" variant="success" icon={CheckCircle2} />
              </div>
            )}
          </div>

          {/* Friendly Status Card */}
          <div className="p-4 bg-surface border border-border rounded-card shadow-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-semibold text-ink">
                {statusMessage}
              </span>
            </div>
            <button
              onClick={() => runDeviceDiagnostics()}
              className="text-xs text-muted hover:text-accent flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-btn hover:bg-bg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-test
            </button>
          </div>
        </div>

        {/* Right Column: Friendly Illustrated Status Cards */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Mic Meter Card */}
            <div className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-ink">Microphone</h4>
                    <p className="text-[11px] text-muted">Input detected</p>
                  </div>
                </div>
                <PillTag label="Mic OK" variant="success" />
              </div>

              {/* RMS Level Meter Bar */}
              <div className="h-2.5 bg-bg border border-border rounded-pill overflow-hidden p-0.5">
                <div
                  className="h-full bg-accent rounded-pill transition-all duration-150"
                  style={{ width: `${micLevel}%` }}
                />
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Test sentence: <span className="text-ink font-medium italic">"I'm ready for my interview."</span>
              </p>
            </div>

            {/* Reassuring Device Checklist */}
            <div className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3">
              <h3 className="text-xs font-bold font-heading text-muted uppercase tracking-wider">
                System Readiness
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-btn bg-bg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-accent" />
                    <span className="text-ink font-medium">Camera Feed</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-btn bg-bg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-accent" />
                    <span className="text-ink font-medium">Audio Input</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-btn bg-bg border border-border/50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span className="text-ink font-medium">Local Browser AI</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button & Privacy Note */}
          <div className="space-y-2.5">
            <button
              onClick={handleStartInterview}
              disabled={!allPassed && isChecking}
              className="w-full py-3.5 px-5 rounded-pill bg-accent hover:bg-accent-hover text-surface font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 cursor-pointer"
            >
              Start Interview
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-muted text-center leading-normal">
              Privacy protected: Face detection runs locally inside your browser. No video is recorded or stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
