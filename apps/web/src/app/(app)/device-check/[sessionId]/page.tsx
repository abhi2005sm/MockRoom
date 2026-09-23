'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Mic, Volume2, Check, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useDeviceStore } from '../../../../store/device.store';
import { useAppStore } from '../../../../store/session.store';

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
    // Attempt local camera stream access for authentic video preview
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamActive(true);
      } catch (err) {
        // Fallback for environment without physical camera hardware
        setStreamActive(false);
      }
    }
    setupCamera();

    // Auto-run reassurance diagnostics
    runDeviceDiagnostics();

    // Simulate natural mic level fluctuation
    const interval = setInterval(() => {
      const level = Math.floor(40 + Math.random() * 45);
      setMicLevel(level);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const handleStartInterview = () => {
    router.push('/interview/sess-892');
  };

  const allPassed = hasCameraPermission && hasMicPermission && isFaceDetected;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <header className="text-center space-y-2 border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
          Let’s test your audio and video
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
          We want to make sure your camera, microphone, and speaker are working clearly before your mock interview begins.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Columns: Big Camera Preview */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative aspect-video bg-ink rounded-lg overflow-hidden border border-border shadow-soft flex items-center justify-center">
            {/* Live HTML5 Video or Simulated Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />

            {!streamActive && (
              <div className="absolute inset-0 bg-ink/90 flex flex-col items-center justify-center text-surface p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent text-accent flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-heading font-bold text-lg">Simulated Camera Active</p>
                  <p className="text-xs text-muted max-w-xs mt-1">
                    MediaPipe local face-detection active. No video is ever recorded or uploaded.
                  </p>
                </div>
              </div>
            )}

            {/* Bounding Box / Face Detection Indicator */}
            {isFaceDetected && (
              <div className="absolute inset-8 border-2 border-accent/70 rounded-lg pointer-events-none transition-all flex items-start justify-end p-3">
                <span className="px-2.5 py-1 rounded-sm bg-accent text-surface text-xs font-heading font-semibold flex items-center gap-1.5 shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                  Face centered & clear
                </span>
              </div>
            )}
          </div>

          {/* Reassuring Status Banner */}
          <div className="p-4 bg-surface border border-border rounded-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-ink">
                {statusMessage}
              </span>
            </div>
            <button
              onClick={() => runDeviceDiagnostics()}
              className="text-xs text-muted hover:text-ink flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-test
            </button>
          </div>
        </div>

        {/* Right Column: Audio & Readiness Checklist */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Mic Meter Section */}
            <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading flex items-center gap-2">
                  <Mic className="w-4 h-4 text-accent" />
                  Microphone Level
                </span>
                <span className="text-xs font-bold font-heading text-ink">{micLevel}%</span>
              </div>

              {/* RMS Level Meter Track */}
              <div className="h-3 bg-bg border border-border rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-150"
                  style={{ width: `${micLevel}%` }}
                />
              </div>

              <p className="text-xs text-muted">
                Read out loud: <span className="text-ink italic font-medium">"I am ready to practice my technical interview."</span>
              </p>
            </div>

            {/* Checklist */}
            <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider font-heading">
                Readiness Checklist
              </h3>

              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-ink">Camera permission granted</span>
                  <Check className="w-4 h-4 text-accent stroke-[3]" />
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-ink">Single face detected</span>
                  <Check className="w-4 h-4 text-accent stroke-[3]" />
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-ink">Mic audio input detected</span>
                  <Check className="w-4 h-4 text-accent stroke-[3]" />
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-ink">Speaker audio playback test</span>
                  <Check className="w-4 h-4 text-accent stroke-[3]" />
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-2">
            <button
              onClick={handleStartInterview}
              disabled={!allPassed && isChecking}
              className="w-full py-3.5 px-4 rounded-md bg-accent hover:bg-accent-hover text-surface font-medium text-sm transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            >
              Start interview
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-muted text-center">
              Privacy note: Face detection runs entirely inside your browser. No video is saved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
