export type WsEventHandler = (data: any) => void;

export class RealtimeWsClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<WsEventHandler>> = new Map();
  private isConnected = false;

  constructor(
    private readonly wsToken: string,
    private readonly sessionId: string,
    private readonly baseUrl: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'
  ) {}

  connect() {
    if (this.ws || typeof window === 'undefined') return;

    const url = `${this.baseUrl}/realtime?token=${encodeURIComponent(this.wsToken)}&sessionId=${encodeURIComponent(this.sessionId)}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.isConnected = true;
      console.log(`Realtime WS Connected for session ${this.sessionId}`);
      this.emitLocal('open', null);
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.event && parsed.data) {
          this.emitLocal(parsed.event, parsed.data);
        }
      } catch (err) {
        console.warn('Failed to parse WS message:', event.data);
      }
    };

    this.ws.onclose = (event) => {
      this.isConnected = false;
      console.log(`Realtime WS Closed (code ${event.code}): ${event.reason}`);
      this.emitLocal('close', event);
    };

    this.ws.onerror = (error) => {
      console.warn('Realtime WS error:', error);
      this.emitLocal('error', error);
    };
  }

  on(event: string, handler: WsEventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: WsEventHandler) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler);
    }
  }

  private emitLocal(event: string, data: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((fn) => fn(data));
    }
  }

  send(event: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    } else {
      console.warn(`Cannot send WS message. Connection not OPEN.`);
    }
  }

  sendTerminalSubmit(text: string, kind: 'text' | 'code' = 'text', questionId?: string) {
    this.send('client.terminal.submit', { text, kind, questionId });
  }

  sendAudioChunk(base64Chunk: string) {
    this.send('audio.chunk', { chunk: base64Chunk });
  }

  sendFaceState(state: 'lost' | 'found', at: number = Date.now()) {
    this.send('client.face', { state, at });
  }

  sendObjectState(type: 'phone_detected' | 'phone_cleared', at: number = Date.now()) {
    this.send('client.object', { type, at });
  }

  sendInterrupt() {
    this.send('client.interrupt', { at: Date.now() });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}
