import { RefObject, useEffect, useRef, useState } from 'react';

interface UseFaceDetectionOptions {
  lostMs?: number;
  multipleMs?: number;
  pollMs?: number;
  onFaceLost?: () => void;
  onFaceFound?: () => void;
  onMultipleFaces?: () => void;
}

/**
 * Local-only face presence check (PRD FR-5 / FR-9). Video never leaves the browser.
 * Uses the Face Detection API when available; otherwise treats an active camera track as in-frame.
 */
export function useFaceDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  {
    lostMs = 4000,
    multipleMs = 3000,
    pollMs = 400,
    onFaceLost,
    onFaceFound,
    onMultipleFaces,
  }: UseFaceDetectionOptions = {}
) {
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const lostSinceRef = useRef<number | null>(null);
  const multipleSinceRef = useRef<number | null>(null);
  const lastEmittedRef = useRef<'lost' | 'found' | 'multiple' | null>(null);

  const onFaceLostRef = useRef(onFaceLost);
  const onFaceFoundRef = useRef(onFaceFound);
  const onMultipleFacesRef = useRef(onMultipleFaces);
  onFaceLostRef.current = onFaceLost;
  onFaceFoundRef.current = onFaceFound;
  onMultipleFacesRef.current = onMultipleFaces;

  useEffect(() => {
    let cancelled = false;
    let detector: { detect: (src: HTMLVideoElement) => Promise<Array<unknown>> } | null = null;

    const FaceDetectorCtor = (typeof window !== 'undefined' ? (window as any).FaceDetector : null) as
      | (new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
          detect: (src: HTMLVideoElement) => Promise<Array<unknown>>;
        })
      | undefined;

    if (FaceDetectorCtor) {
      try {
        detector = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 4 });
      } catch {
        detector = null;
      }
    }

    const tick = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      const ready = Boolean(video && video.readyState >= 2 && video.videoWidth > 0);

      let count = 0;
      if (detector && video && ready) {
        try {
          const faces = await detector.detect(video);
          count = faces.length;
        } catch {
          count = ready ? 1 : 0;
        }
      } else if (ready) {
        count = 1;
      }

      if (cancelled) return;
      setFaceCount(count);

      if (count === 1) {
        lostSinceRef.current = null;
        multipleSinceRef.current = null;
        setIsFaceDetected(true);
        if (lastEmittedRef.current !== 'found') {
          lastEmittedRef.current = 'found';
          onFaceFoundRef.current?.();
        }
        return;
      }

      if (count > 1) {
        lostSinceRef.current = null;
        if (multipleSinceRef.current == null) multipleSinceRef.current = Date.now();
        if (Date.now() - multipleSinceRef.current >= multipleMs && lastEmittedRef.current !== 'multiple') {
          lastEmittedRef.current = 'multiple';
          setIsFaceDetected(true);
          onMultipleFacesRef.current?.();
        }
        return;
      }

      multipleSinceRef.current = null;
      if (lostSinceRef.current == null) lostSinceRef.current = Date.now();
      if (Date.now() - lostSinceRef.current >= lostMs && lastEmittedRef.current !== 'lost') {
        lastEmittedRef.current = 'lost';
        setIsFaceDetected(false);
        onFaceLostRef.current?.();
      }
    };

    const id = window.setInterval(() => {
      void tick();
    }, pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [videoRef, lostMs, multipleMs, pollMs]);

  return { isFaceDetected, faceCount };
}
