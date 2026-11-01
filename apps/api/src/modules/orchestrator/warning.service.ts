import { Injectable, Inject, Logger } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { TtsProvider } from '../ai/interfaces/tts.provider';
import { WebSocket } from 'ws';

export interface WarningEvent {
  type: 'face' | 'mic' | 'network' | 'phone';
  message: string;
}

@Injectable()
export class WarningService {
  private readonly logger = new Logger(WarningService.name);
  private phoneTimers = new Map<string, NodeJS.Timeout>();
  private activeWarnings = new Map<string, 'phone' | 'face' | 'mic'>();
  private multipleFaceWarned = new Set<string>();

  constructor(
    private readonly orchestratorService: OrchestratorService,
    @Inject('TTS_PROVIDER') private readonly ttsProvider: TtsProvider
  ) {}

  async handlePhoneDetected(
    client: WebSocket,
    sessionId: string,
    sendJson: (client: WebSocket, event: string, payload: any) => void
  ) {
    if (this.activeWarnings.get(sessionId) === 'phone') return; // Already active

    this.logger.warn(`[WarningService] Phone detected for session ${sessionId}. Readiness warning only.`);
    this.activeWarnings.set(sessionId, 'phone');

    // 1. Pause interview timer
    const sm = this.orchestratorService.getOrCreateStateMachine(sessionId);
    sm.pauseTimer();

    const warningMessage = 'Another device is in view. Please set it aside so we can keep talking.';
    const spokenWarning =
      'I can see another device in your camera. Could you set that aside so we can keep going?';

    // 2. Broadcast warning banner payload to frontend
    sendJson(client, 'server.warning', {
      type: 'phone',
      message: warningMessage,
    });

    // 3. Spoken warning via TTS
    try {
      this.logger.log(`[WarningService] Synthesizing spoken warning via TTS for session ${sessionId}`);
      await this.ttsProvider.synthesizeSpeech({
        text: spokenWarning,
        voiceId: 'p-sarah',
        onAudioChunk: (chunk) => {
          sendJson(client, 'server.audio.chunk', {
            chunk: chunk.toString('base64'),
          });
        },
      });
    } catch (err: any) {
      this.logger.warn(`[WarningService] Spoken TTS warning failed: ${err.message}`);
    }

    // 4. Emit event for timeline
    sendJson(client, 'server.event.recorded', {
      type: 'phone_detected',
      at: Date.now(),
      detail: warningMessage,
    });
  }

  async handleMultipleFaces(
    client: WebSocket,
    sessionId: string,
    sendJson: (client: WebSocket, event: string, payload: any) => void
  ) {
    if (this.multipleFaceWarned.has(sessionId)) return;
    this.multipleFaceWarned.add(sessionId);

    const warningMessage = 'More than one person is in frame. Please sit so only you are on camera.';
    sendJson(client, 'server.warning', {
      type: 'face',
      message: warningMessage,
    });
    sendJson(client, 'server.event.recorded', {
      type: 'multiple_faces',
      at: Date.now(),
      detail: warningMessage,
    });
  }

  async handleFaceLost(
    client: WebSocket,
    sessionId: string,
    sendJson: (client: WebSocket, event: string, payload: any) => void
  ) {
    if (this.activeWarnings.get(sessionId) === 'face') return;

    this.activeWarnings.set(sessionId, 'face');
    const sm = this.orchestratorService.getOrCreateStateMachine(sessionId);
    sm.pauseTimer();

    const warningMessage = "I can't see you on camera. Please move back into frame.";
    const spokenWarning = "I can't see you on camera right now. Could you move back into frame?";

    sendJson(client, 'server.warning', {
      type: 'face',
      message: warningMessage,
    });

    try {
      await this.ttsProvider.synthesizeSpeech({
        text: spokenWarning,
        voiceId: 'p-sarah',
        onAudioChunk: (chunk) => {
          sendJson(client, 'server.audio.chunk', {
            chunk: chunk.toString('base64'),
          });
        },
      });
    } catch (err: any) {
      this.logger.warn(`[WarningService] Face-lost TTS failed: ${err.message}`);
    }

    sendJson(client, 'server.event.recorded', {
      type: 'face_lost',
      at: Date.now(),
      detail: warningMessage,
    });
  }

  async handleFaceFound(
    client: WebSocket,
    sessionId: string,
    sendJson: (client: WebSocket, event: string, payload: any) => void
  ) {
    if (this.activeWarnings.get(sessionId) !== 'face') return;

    this.activeWarnings.delete(sessionId);
    const sm = this.orchestratorService.getOrCreateStateMachine(sessionId);
    sm.resumeTimer();

    sendJson(client, 'server.warning.cleared', { type: 'face' });
    sendJson(client, 'server.event.recorded', {
      type: 'face_found',
      at: Date.now(),
    });
  }

  async handleMicSilent(
    client: WebSocket,
    sessionId: string,
    sendJson: (client: WebSocket, event: string, payload: any) => void
  ) {
    if (this.activeWarnings.get(sessionId) === 'mic') return;
    this.activeWarnings.set(sessionId, 'mic');

    const warningMessage = "I can't hear you. Check that your microphone is on.";
    const spokenWarning = "I'm not catching any audio on my side. Could you check that your microphone is unmuted?";

    sendJson(client, 'server.warning', {
      type: 'mic',
      message: warningMessage,
    });

    try {
      await this.ttsProvider.synthesizeSpeech({
        text: spokenWarning,
        voiceId: 'p-sarah',
        onAudioChunk: (chunk) => {
          sendJson(client, 'server.audio.chunk', {
            chunk: chunk.toString('base64'),
          });
        },
      });
    } catch (err: any) {
      this.logger.warn(`[WarningService] Mic-silent TTS failed: ${err.message}`);
    }
  }

  clearMicWarning(
    client: WebSocket,
    sessionId: string,
    sendJson: (client: WebSocket, event: string, payload: any) => void
  ) {
    if (this.activeWarnings.get(sessionId) !== 'mic') return;
    this.activeWarnings.delete(sessionId);
    sendJson(client, 'server.warning.cleared', { type: 'mic' });
  }

  async handlePhoneCleared(
    client: WebSocket,
    sessionId: string,
    sendJson: (client: WebSocket, event: string, payload: any) => void
  ) {
    if (this.activeWarnings.get(sessionId) !== 'phone') return;

    this.logger.log(`[WarningService] Phone cleared for session ${sessionId}. Resuming interview session.`);
    this.activeWarnings.delete(sessionId);

    // Resume interview timer
    const sm = this.orchestratorService.getOrCreateStateMachine(sessionId);
    sm.resumeTimer();

    // Clear warning banner on client
    sendJson(client, 'server.warning.cleared', {
      type: 'phone',
    });

    // Emit event for timeline
    sendJson(client, 'server.event.recorded', {
      type: 'phone_cleared',
      at: Date.now(),
    });
  }
}
