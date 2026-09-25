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

      // Retrieve state machine to preserve session state on reconnect
      const sm = this.orchestratorService.getOrCreateStateMachine(sessionId);
      const state = sm.getContext();

      // Emit current interview state on connect/reconnect
      this.sendJson(client, 'server.state', {
        round: state.currentRound,
        timeRemaining: state.timeRemainingSeconds,
        questionIndex: state.questionIndex,
        total: state.totalQuestions,
        mode: 'realistic',
        persona: 'p-sarah',
      });
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

  private async processTurn(
    client: WebSocket,
    sessionId: string,
    candidateText: string
  ) {
    try {
      const result = await this.orchestratorService.processCandidateMessage(
        sessionId,
        candidateText,
        'p-sarah',
        undefined,
        (tokenDelta) => {
          // Token-by-token streaming response to client
          this.sendJson(client, 'server.interviewer.stream', { delta: tokenDelta });
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

      // Graceful fallback warning to client without breaking session
      this.sendJson(client, 'server.warning', {
        type: 'tts',
        message: 'TTS/LLM processing encounter a temporary issue; displaying captions.',
      });
    }
  }

  @SubscribeMessage('client.face')
  handleFaceState(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() payload: { state: 'lost' | 'found'; at: number }
  ) {
    if (payload.state === 'lost') {
      this.sendJson(client, 'server.warning', {
        type: 'face',
        message: 'Face camera feed lost. Please position your face clearly in frame.',
      });
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
