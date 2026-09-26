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

    this.logger.warn(`[WarningService] Phone detected continuously for session ${sessionId}. Triggering proctoring warning.`);
    this.activeWarnings.set(sessionId, 'phone');

    // 1. Pause interview timer
    const sm = this.orchestratorService.getOrCreateStateMachine(sessionId);
    sm.pauseTimer();

    const warningMessage =
      'Phone detected in camera frame. Please place it out of view to continue.';
    const spokenWarning =
      "I can see a phone in your camera view. Using a phone during this interview isn't allowed and may affect your results — could you put it out of frame?";

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
