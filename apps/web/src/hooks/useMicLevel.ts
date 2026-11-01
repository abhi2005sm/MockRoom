import { useEffect, useRef, useState } from 'react';

interface UseMicLevelOptions {
  enabled?: boolean;
  stream?: MediaStream | null;
}

/**
 * Local RMS meter from the mic. Audio stays in the browser (PRD FR-6 / FR-10).
 */
export function useMicLevel({ enabled = true, stream = null }: UseMicLevelOptions = {}) {
  const [level, setLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const ownStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setLevel(0);
      return;
    }

    let cancelled = false;
    let ctx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let raf = 0;

    const start = async () => {
      try {
        const media =
          stream ||
          (await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: false,
          }));
        if (!stream) ownStreamRef.current = media;
        if (cancelled) {
          if (!stream) media.getTracks().forEach((t) => t.stop());
          return;
        }

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctx = new AudioCtx();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source = ctx.createMediaStreamSource(media);
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        setHasPermission(true);

        const tick = () => {
          if (cancelled || !analyser) return;
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setLevel(Math.min(100, Math.round(rms * 280)));
          raf = window.requestAnimationFrame(tick);
        };
        tick();
      } catch {
        if (!cancelled) {
          setHasPermission(false);
          setLevel(0);
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      if (raf) window.cancelAnimationFrame(raf);
      source?.disconnect();
      analyser?.disconnect();
      void ctx?.close();
      ownStreamRef.current?.getTracks().forEach((t) => t.stop());
      ownStreamRef.current = null;
    };
  }, [enabled, stream]);

  return { level, hasPermission };
}
