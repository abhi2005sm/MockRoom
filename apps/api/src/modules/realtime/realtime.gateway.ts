import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { AuthService } from '../auth/auth.service';
import { OrchestratorService } from '../orchestrator/orchestrator.service';

@WebSocketGateway({ path: '/realtime' })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly authService: AuthService,
    private readonly orchestratorService: OrchestratorService,
  ) {}

  async handleConnection(client: WebSocket & { user?: any; sessionId?: string }, req: any) {
    try {
      const url = req.url || '';
      const searchParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
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

      this.logger.log(`WS Client connected for session ${sessionId} (User: ${payload.sub})`);

      // Emit initial state connection event
      this.sendJson(client, 'server.state', {
        round: 'warmup',
        timeRemaining: 2700,
        questionIndex: 1,
        total: 7,
        mode: 'realistic',
        persona: 'p-sarah',
      });
    } catch (err) {
      this.logger.warn(`WS Auth failed: ${err.message}`);
      client.close(4002, 'Authentication failed');
    }
  }

  handleDisconnect(client: WebSocket & { sessionId?: string }) {
    this.logger.log(`WS Client disconnected for session ${client.sessionId || 'unknown'}`);
  }

  @SubscribeMessage('client.terminal.submit')
  async handleTerminalSubmit(
    @ConnectedSocket() client: WebSocket & { sessionId?: string },
    @MessageBody() payload: { questionId?: string; text: string; kind?: string }
  ) {
    const sessionId = client.sessionId || 'sess-892';
    this.logger.log(`Terminal submit received on session ${sessionId}: "${payload.text}"`);

    const result = await this.orchestratorService.processCandidateMessage(
      sessionId,
      payload.text,
      'p-sarah'
    );

    // Emit captions text to client
    this.sendJson(client, 'server.interviewer.text', {
      text: result.interviewerText,
      turnId: result.turnId,
    });

    // Emit updated interview state
    this.sendJson(client, 'server.state', result.state);

    if (result.state.isCompleted) {
      this.sendJson(client, 'server.session.ended', { reportPending: true });
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
