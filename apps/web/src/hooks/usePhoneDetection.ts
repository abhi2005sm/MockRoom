import { useEffect, useRef, useState } from 'react';

interface PhoneDetectionOptions {
  enabled?: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  onPhoneDetected?: () => void;
  onPhoneCleared?: () => void;
}

export function usePhoneDetection({
  enabled = true,
  videoRef,
  onPhoneDetected,
  onPhoneCleared,
}: PhoneDetectionOptions) {
  const [isPhoneDetected, setIsPhoneDetected] = useState(false);
  const detectedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveDetectCountRef = useRef(0);
  const consecutiveClearCountRef = useRef(0);

  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const checkFrame = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || video.readyState < 2) return;

      canvas.width = 160;
      canvas.height = 120;

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;

        // Lightweight local heuristic / bounding box analysis for high-contrast handheld rectangular objects (phone-like)
        let darkPixelCount = 0;
        let edgeCount = 0;

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;

          if (brightness < 45) {
            darkPixelCount++;
          }
          if (i > 16) {
            const prevR = data[i - 16];
            if (Math.abs(r - prevR) > 60) {
              edgeCount++;
            }
          }
        }

        // Simulating continuous 3-second frame threshold
        const phoneLikeRatio = darkPixelCount / (canvas.width * canvas.height / 16);
        const hasPhoneFeatures = phoneLikeRatio > 0.15 && edgeCount > 100;

        if (hasPhoneFeatures) {
          consecutiveClearCountRef.current = 0;
          consecutiveDetectCountRef.current += 1;

          // 3 seconds threshold (~15 consecutive interval hits at 200ms)
          if (consecutiveDetectCountRef.current >= 15 && !isPhoneDetected) {
            setIsPhoneDetected(true);
            if (onPhoneDetected) onPhoneDetected();
          }
        } else {
          consecutiveDetectCountRef.current = 0;
          consecutiveClearCountRef.current += 1;

          // 2 seconds clear threshold (~10 consecutive hits)
          if (consecutiveClearCountRef.current >= 10 && isPhoneDetected) {
            setIsPhoneDetected(false);
            if (onPhoneCleared) onPhoneCleared();
          }
        }
      }
    };

    const interval = setInterval(checkFrame, 200);

    return () => {
      clearInterval(interval);
      if (detectedTimerRef.current) clearTimeout(detectedTimerRef.current);
      if (clearedTimerRef.current) clearTimeout(clearedTimerRef.current);
    };
  }, [enabled, videoRef, isPhoneDetected, onPhoneDetected, onPhoneCleared]);

  return {
    isPhoneDetected,
    simulatePhoneDetected: () => {
      setIsPhoneDetected(true);
      if (onPhoneDetected) onPhoneDetected();
    },
    simulatePhoneCleared: () => {
      setIsPhoneDetected(false);
      if (onPhoneCleared) onPhoneCleared();
    },
  };
}
