'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, MicOff, Smartphone, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { usePhoneDetection } from '../../hooks/usePhoneDetection';
import { useFaceDetection } from '../../hooks/useFaceDetection';

interface CandidateCameraProps {
  isCandidateSpeaking: boolean;
  isMicMuted?: boolean;
  onFaceLost?: () => void;
  onFaceFound?: () => void;
  onMultipleFaces?: () => void;
  onPhoneDetected?: () => void;
  onPhoneCleared?: () => void;
  compact?: boolean;
}

export function CandidateCamera({
  isCandidateSpeaking,
  isMicMuted = false,
  onFaceLost,
  onFaceFound,
  onMultipleFaces,
  onPhoneDetected,
  onPhoneCleared,
  compact = false,
}: CandidateCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasStream(true);
        }
      } catch {
        setHasStream(false);
      }
    }
    setupCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const { isFaceDetected, faceCount } = useFaceDetection(videoRef, {
    lostMs: 4000,
    multipleMs: 3000,
    onFaceLost,
    onFaceFound,
    onMultipleFaces,
  });

  const { isPhoneDetected } = usePhoneDetection({
    videoRef,
    onPhoneDetected,
    onPhoneCleared,
  });

  const statusLabel =
    faceCount > 1 ? 'More than one person' : isFaceDetected ? 'In frame' : 'Face not visible';

  return (
    <div
      className={clsx(
        'relative w-full bg-ink overflow-hidden border border-white/20 shadow-lg flex items-center justify-center',
        compact ? 'aspect-video rounded-lg' : 'aspect-video rounded-xl'
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={clsx('w-full h-full object-cover scale-x-[-1]', hasStream ? 'block' : 'hidden')}
      />

      {!hasStream && (
        <div className="flex flex-col items-center justify-center text-white/70 space-y-1 p-3">
          <Camera className="w-6 h-6" />
          <span className="text-[10px] font-medium">Camera</span>
        </div>
      )}

      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-semibold flex items-center gap-1">
        {isMicMuted ? (
          <MicOff className="w-3 h-3 text-white/50" />
        ) : (
          <Mic className={clsx('w-3 h-3', isCandidateSpeaking ? 'text-emerald-400' : 'text-white/70')} />
        )}
        You
      </div>

      <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
        <div className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-semibold text-white flex items-center gap-1">
          {faceCount > 1 ? <Users className="w-3 h-3 text-amber-200" /> : null}
          <span
            className={clsx(
              'w-1.5 h-1.5 rounded-full',
              faceCount > 1 ? 'bg-amber-400' : isFaceDetected ? 'bg-emerald-400' : 'bg-amber-400'
            )}
          />
          {statusLabel}
        </div>
        {isPhoneDetected && (
          <div className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-semibold text-amber-200 flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            Device in view
          </div>
        )}
      </div>
    </div>
  );
}
