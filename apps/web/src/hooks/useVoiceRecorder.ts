import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceRecorderOptions {
  onTranscriptChange?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onAudioChunk?: (base64Chunk: string) => void;
  autoSubmitSilenceMs?: number;
}

export function useVoiceRecorder({
  onTranscriptChange,
  onFinalTranscript,
  onAudioChunk,
  autoSubmitSilenceMs = 2500,
}: VoiceRecorderOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const wantListenRef = useRef(false);
  const transcriptRef = useRef('');
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  onFinalTranscriptRef.current = onFinalTranscript;

  // Initialize SpeechRecognition if available
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + ' ';
          } else {
            interimStr += res[0].transcript;
          }
        }

        if (finalStr) {
          setTranscript((prev) => {
            const updated = (prev + ' ' + finalStr).trim();
            transcriptRef.current = updated;
            if (onTranscriptChange) onTranscriptChange(updated);
            return updated;
          });
        }

        setInterimTranscript(interimStr);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (autoSubmitSilenceMs > 0 && (finalStr || interimStr)) {
          silenceTimerRef.current = setTimeout(() => {
            const spoken = transcriptRef.current.trim();
            if (spoken) {
              onFinalTranscriptRef.current?.(spoken);
              transcriptRef.current = '';
              setTranscript('');
              setInterimTranscript('');
            }
          }, autoSubmitSilenceMs);
        }
      };

      rec.onerror = (evt: any) => {
        console.warn('[useVoiceRecorder] SpeechRecognition error:', evt.error);
        if (evt.error !== 'no-speech') {
          setError(`Speech recognition error: ${evt.error}`);
        }
      };

      rec.onend = () => {
        if (wantListenRef.current) {
          try {
            rec.start();
            return;
          } catch {
            /* already started */
          }
        }
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [autoSubmitSilenceMs, onTranscriptChange]);

  const startListening = useCallback(async () => {
    setError(null);
    wantListenRef.current = true;
    try {
      // 1. Request microphone media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setHasMicPermission(true);

      // 2. Setup MediaRecorder for backend audio chunk streaming
      if (MediaRecorder && onAudioChunk) {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';
        const mediaRecorder = new MediaRecorder(stream, { mimeType });

        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = (reader.result as string).split(',')[1];
              if (base64data) onAudioChunk(base64data);
            };
            reader.readAsDataURL(e.data);
          }
        };
        mediaRecorder.start(250); // Emit chunk every 250ms
        mediaRecorderRef.current = mediaRecorder;
      }

      // 3. Start browser speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // May already be started
        }
      }

      setIsListening(true);
    } catch (err: any) {
      console.error('[useVoiceRecorder] Failed to start microphone:', err);
      setHasMicPermission(false);
      setError('Microphone access denied or unavailable.');
    }
  }, [onAudioChunk]);

  const stopListening = useCallback(() => {
    wantListenRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    hasMicPermission,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
