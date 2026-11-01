import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, Inject, Optional } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { AuthService } from '../auth/auth.service';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { WarningService } from '../orchestrator/warning.service';
import { SttProvider } from '../ai/interfaces/stt.provider';

const getAllowedOrigins = () => {
  const raw = process.env.ALLOWED_ORIGINS;
  return raw ? raw.split(',').map((s) => s.trim()) : ['http://localhost:3000'];
};

@WebSocketGateway({
  path: '/realtime',
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly authService: AuthService,
    private readonly orchestratorService: OrchestratorService,
    private readonly warningService: WarningService,
    @Optional() @Inject('STT_PROVIDER') private readonly sttProvider?: SttProvider
  ) {}

  async handleConnection(
    client: WebSocket & { user?: any; sessionId?: string; isAlive?: boolean },
    req: any
  ) {
    try {
      const url = req.url || '';
      const searchParams = new URLSearchParams(
        url.includes('?') ? url.split('?')[1] : ''
      );
      const token = searchParams.get('token');
      const sessionId = searchParams.get('sessionId') || 'sess-892';

      if (!token) {
        this.logger.warn('WS connection rejected: Token missing');
        client.close(4001, 'Authentication token required');
        return;
      }

      const payload = await this.authService.verifyWsToken(token);
      client.user = payload;
      client.sessionId = sessionId;
      client.isAlive = true;

      this.logger.log(
        `WS Client connected/reconnected for session ${sessionId} (User: ${payload.sub})`
      );

      const sm = this.orchestratorService.getOrCreateStateMachine(sessionId);
      const state = sm.getContext();

      this.sendJson(client, 'server.state', {
        round: state.currentRound,
        timeRemaining: state.timeRemainingSeconds,
        questionIndex: state.questionIndex,
        total: state.totalQuestions,
        mode: 'realistic',
        persona: 'alex-tech-lead',
      });

      if (!state.openingDelivered) {
        void this.deliverOpening(client, sessionId);
      }
    } catch (err: any) {
      this.logger.warn(`WS Auth failed: ${err.message}`);
      client.close(4002, 'Authentication failed');
    }
  }

  handleDisconnect(client: WebSocket & { sessionId?: string }) {
    this.logger.log(
      `WS Client disconnected for session ${client.sessionId || 'unknown'}`
    );
  }

  @SubscribeMessage('client.token.refresh')
  async handleTokenRefresh(
    @ConnectedSocket() client: WebSocket & { user?: any; sessionId?: string },
    @MessageBody() payload: { token: string }
  ) {
    try {
      if (!payload?.token) {
        this.sendJson(client, 'server.warning', {
          type: 'auth',
          message: 'Refresh token payload missing',
        });
        return;
      }

      const verified = await this.authService.verifyWsToken(payload.token);
      client.user = verified;

      this.logger.log(
        `WS Token refreshed successfully mid-session for user ${verified.sub} in session ${client.sessionId}`
      );

      this.sendJson(client, 'server.token.refreshed', {
        status: 'ok',
        expiresAt: verified.exp,
      });
    } catch (err: any) {
      this.logger.warn(`WS Token refresh failed: ${err.message}`);
      this.sendJson(client, 'server.warning', {
        type: 'auth',
        message: 'Mid-session token refresh failed. Please re-authenticate.',
      });
    }
  }

  @SubscribeMessage('audio.chunk')
  async handleAudioChunk(
    @ConnectedSocket() client: WebSocket & { sessionId?: string },
    @MessageBody() payload: Buffer | { chunk: string }
  ) {
    const sessionId = client.sessionId || 'sess-892';
    const buffer = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from((payload as any).chunk || '', 'base64');

    if (!buffer.length) return;

    this.logger.log(`[RealtimeGateway] Received audio.chunk frame of ${buffer.length} bytes for session ${sessionId}`);

    if (this.sttProvider) {
      try {
        const transcriptResult = await this.sttProvider.transcribeChunk(buffer);

        if (transcriptResult.text) {
          if (transcriptResult.isFinal) {
            this.sendJson(client, 'server.transcript.final', {
              text: transcriptResult.text,
              startMs: transcriptResult.startMs,
              endMs: transcriptResult.endMs,
              words: transcriptResult.words || [],
            });

            // Process candidate turn through orchestrator
            await this.processTurn(client, sessionId, transcriptResult.text);
          } else {
            this.sendJson(client, 'server.transcript.interim', {
              text: transcriptResult.text,
            });
          }
        }
      } catch (sttErr: any) {
        this.logger.warn(`STT processing chunk error: ${sttErr.message}`);
      }
    }
  }

  @SubscribeMessage('client.terminal.submit')
  async handleTerminalSubmit(
    @ConnectedSocket() client: WebSocket & { sessionId?: string },
    @MessageBody() payload: { questionId?: string; text: string; kind?: string }
  ) {
    const sessionId = client.sessionId || 'sess-892';
    this.logger.log(
      `Terminal submit received on session ${sessionId}: "${payload.text}"`
    );

    await this.processTurn(client, sessionId, payload.text);
  }

  private async deliverOpening(client: WebSocket, sessionId: string) {
    try {
      const result = await this.orchestratorService.startOpeningTurn(
        sessionId,
        'alex-tech-lead',
        (tokenDelta) => {
          this.sendJson(client, 'server.interviewer.stream', { delta: tokenDelta });
        },
        (audioBuf) => {
          this.sendJson(client, 'server.audio.chunk', {
            chunk: audioBuf.toString('base64'),
          });
        }
      );
      if (!result) return;
      this.sendJson(client, 'server.interviewer.text', {
        text: result.interviewerText,
        turnId: result.turnId,
      });
      this.sendJson(client, 'server.state', result.state);
    } catch (err: any) {
      this.logger.warn(`Opening turn failed: ${err.message}`);
    }
  }

  private async processTurn(
    client: WebSocket,
    sessionId: string,
    candidateText: string
  ) {
    try {
      this.sendJson(client, 'server.interviewer.ack', { text: 'Okay.' });
      await this.orchestratorService.speakAckFiller('alex-tech-lead', (audioBuf) => {
        this.sendJson(client, 'server.audio.chunk', {
          chunk: audioBuf.toString('base64'),
        });
      });

      const result = await this.orchestratorService.processCandidateMessage(
        sessionId,
        candidateText,
        'alex-tech-lead',
        undefined,
        (tokenDelta) => {
          // Token-by-token streaming response to client
          this.sendJson(client, 'server.interviewer.stream', { delta: tokenDelta });
        },
        (audioBuf) => {
          // Send synthesized TTS audio chunk to client over WebSocket
          this.sendJson(client, 'server.audio.chunk', {
            chunk: audioBuf.toString('base64'),
          });
        }
      );

      // Emit full interviewer captions text
      this.sendJson(client, 'server.interviewer.text', {
        text: result.interviewerText,
        turnId: result.turnId,
      });

      // Emit updated state
      this.sendJson(client, 'server.state', result.state);

      if (result.state.isCompleted) {
        this.sendJson(client, 'server.session.ended', { reportPending: true });
      }
    } catch (err: any) {
      this.logger.error(`Error processing turn: ${err.message}`);

      // Surfacing explicit warning event so frontend knows pipeline degraded
      this.sendJson(client, 'server.warning', {
        type: 'tts',
        message: 'TTS/LLM processing encountered a temporary issue; displaying captions.',
      });
    }
  }

  @SubscribeMessage('client.face')
  async handleFaceState(
    @ConnectedSocket() client: WebSocket & { sessionId?: string },
    @MessageBody() payload: { state: 'lost' | 'found' | 'multiple'; at: number }
  ) {
    const sessionId = client.sessionId || 'sess-892';
    if (payload.state === 'multiple') {
      await this.warningService.handleMultipleFaces(client, sessionId, (c, event, p) =>
        this.sendJson(c, event, p)
      );
      return;
    }
    if (payload.state === 'lost') {
      await this.warningService.handleFaceLost(client, sessionId, (c, event, p) =>
        this.sendJson(c, event, p)
      );
    } else {
      await this.warningService.handleFaceFound(client, sessionId, (c, event, p) =>
        this.sendJson(c, event, p)
      );
    }
  }

  @SubscribeMessage('client.mic')
  async handleMicState(
    @ConnectedSocket() client: WebSocket & { sessionId?: string },
    @MessageBody() payload: { state: 'silent' | 'ok'; at: number }
  ) {
    const sessionId = client.sessionId || 'sess-892';
    if (payload.state === 'silent') {
      await this.warningService.handleMicSilent(client, sessionId, (c, event, p) =>
        this.sendJson(c, event, p)
      );
    } else {
      this.warningService.clearMicWarning(client, sessionId, (c, event, p) =>
        this.sendJson(c, event, p)
      );
    }
  }

  @SubscribeMessage('client.control')
  handleControl(
    @ConnectedSocket() client: WebSocket & { sessionId?: string },
    @MessageBody() payload: { action: 'pause' | 'resume' | 'end' }
  ) {
    const sessionId = client.sessionId || 'sess-892';
    const sm = this.orchestratorService.getOrCreateStateMachine(sessionId);
    if (payload.action === 'pause') sm.pause();
    if (payload.action === 'resume') sm.resume();
    if (payload.action === 'end') {
      sm.endSession();
      this.sendJson(client, 'server.session.ended', { reportPending: true });
    }
  }

  @SubscribeMessage('client.object')
  async handleClientObject(
    @ConnectedSocket() client: WebSocket & { sessionId?: string },
    @MessageBody() payload: { type: 'phone_detected' | 'phone_cleared'; at: number }
  ) {
    const sessionId = client.sessionId || 'sess-892';
    this.logger.log(`[RealtimeGateway] Received client.object event (${payload.type}) for session ${sessionId}`);

    if (payload.type === 'phone_detected') {
      await this.warningService.handlePhoneDetected(client, sessionId, (c, event, p) =>
        this.sendJson(c, event, p)
      );
    } else if (payload.type === 'phone_cleared') {
      await this.warningService.handlePhoneCleared(client, sessionId, (c, event, p) =>
        this.sendJson(c, event, p)
      );
    }
  }

  @SubscribeMessage('client.interrupt')
  handleInterrupt(@ConnectedSocket() client: WebSocket) {
    this.logger.log('Barge-in interrupt received from client. Halting audio stream.');
  }

  private sendJson(client: WebSocket, event: string, payload: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data: payload }));
    }
  }
}
