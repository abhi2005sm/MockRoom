'use client';

import React, { useEffect, useRef } from 'react';
import { Camera, User, Mic, Smartphone } from 'lucide-react';
import { clsx } from 'clsx';
import { usePhoneDetection } from '../../hooks/usePhoneDetection';

interface CandidateCameraProps {
  isCandidateSpeaking: boolean;
  isFaceDetected: boolean;
  onPhoneDetected?: () => void;
  onPhoneCleared?: () => void;
}

export function CandidateCamera({
  isCandidateSpeaking,
  isFaceDetected,
  onPhoneDetected,
  onPhoneCleared,
}: CandidateCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log('Webcam not active or permission denied; using canvas preview');
      }
    }
    setupCamera();
  }, []);

  const { isPhoneDetected, simulatePhoneDetected, simulatePhoneCleared } = usePhoneDetection({
    videoRef,
    onPhoneDetected,
    onPhoneCleared,
  });

  return (
    <div className="relative aspect-video w-full bg-ink rounded-lg overflow-hidden border border-border shadow-sm flex items-center justify-center group">
      {/* Real Video element or Fallback Avatar */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg hidden"
      />

      <div className="flex flex-col items-center justify-center text-muted space-y-1">
        <div className="w-12 h-12 rounded-full bg-surface/10 border border-surface/20 flex items-center justify-center text-surface">
          <User className="w-6 h-6 text-muted" />
        </div>
        <span className="text-[10px] text-muted font-body">Candidate Feed (Local)</span>
      </div>

      {/* Mic Status Indicator */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface/80 text-ink text-[10px] font-heading font-semibold flex items-center gap-1">
        <Mic className={clsx('w-3 h-3', isCandidateSpeaking ? 'text-accent' : 'text-muted')} />
        {isCandidateSpeaking ? 'Mic Active' : 'Muted'}
      </div>

      {/* Status Pills */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
        <div className="px-2 py-0.5 rounded bg-surface/80 text-[10px] font-heading font-semibold text-ink flex items-center gap-1">
          <span className={clsx('w-1.5 h-1.5 rounded-full', isFaceDetected ? 'bg-accent' : 'bg-severity-weak')} />
          {isFaceDetected ? 'Face OK' : 'No Face'}
        </div>

        <div className="px-2 py-0.5 rounded bg-surface/80 text-[10px] font-heading font-semibold text-ink flex items-center gap-1">
          <Smartphone className={clsx('w-3 h-3', isPhoneDetected ? 'text-accent-warm' : 'text-muted')} />
          {isPhoneDetected ? 'Phone Detected' : 'Clean Frame'}
        </div>
      </div>

      {/* Development Quick-Testing Simulation Controls */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <button
          onClick={isPhoneDetected ? simulatePhoneCleared : simulatePhoneDetected}
          className="px-2 py-0.5 bg-accent-warm/20 text-accent-warm hover:bg-accent-warm/30 rounded text-[9px] font-bold"
        >
          {isPhoneDetected ? 'Clear Phone' : 'Simulate Phone'}
        </button>
      </div>
    </div>
  );
}
