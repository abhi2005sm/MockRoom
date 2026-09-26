import { useEffect, useRef } from 'react';
import { RealtimeWsClient } from '../lib/ws-client';
import { useAppStore } from '../store/session.store';
import { globalAudioPlayer } from '../lib/audio-player';

export function useRealtimeSocket(wsToken?: string, sessionId?: string) {
  const wsClientRef = useRef<RealtimeWsClient | null>(null);
  const {
    handleServerCaptions,
    handleServerState,
    triggerWarning,
    clearWarning,
    handleSessionEnded,
  } = useAppStore();

  useEffect(() => {
    if (!wsToken || !sessionId) return;

    const ws = new RealtimeWsClient(wsToken, sessionId);
    wsClientRef.current = ws;

    ws.on('server.interviewer.text', (data: { text: string; turnId: string }) => {
      handleServerCaptions(data.text, data.turnId);
    });

    ws.on('server.audio.chunk', (data: { chunk: string }) => {
      if (data?.chunk) {
        globalAudioPlayer.playChunk(data.chunk);
      }
    });

    ws.on('server.state', (data: any) => {
      handleServerState(data);
    });

    ws.on('server.warning', (data: { type: 'face' | 'mic' | 'network' | 'phone'; message: string }) => {
      triggerWarning(data.type, data.message);
    });

    ws.on('server.warning.cleared', () => {
      clearWarning();
    });

    ws.on('server.session.ended', () => {
      handleSessionEnded();
    });

    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, [wsToken, sessionId]);

  return {
    sendTerminalSubmit: (text: string, kind: 'text' | 'code' = 'text') => {
      wsClientRef.current?.sendTerminalSubmit(text, kind);
    },
    sendAudioChunk: (base64Chunk: string) => {
      wsClientRef.current?.sendAudioChunk(base64Chunk);
    },
    sendFaceState: (state: 'lost' | 'found') => {
      wsClientRef.current?.sendFaceState(state);
    },
    sendObjectState: (type: 'phone_detected' | 'phone_cleared') => {
      wsClientRef.current?.sendObjectState(type);
    },
    sendInterrupt: () => {
      globalAudioPlayer.clearQueue();
      wsClientRef.current?.sendInterrupt();
    },
    unlockAudioPlayback: () => {
      globalAudioPlayer.unlockAudio();
    },
  };
}
