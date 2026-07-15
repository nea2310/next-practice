// lib/websocket.ts
type MessageHandler = (data: any) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001';
    this.ws = new WebSocket(`${WS_URL}?token=${token}`);

    this.ws.onopen = () => console.log('WebSocket connected');
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Передаём сообщение всем подписчикам
      for (const handler of this.handlers) {
        handler(message);
      }
    };
    this.ws.onerror = (err) => console.error('WebSocket error', err);
    this.ws.onclose = () => console.log('WebSocket closed');
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.handlers.clear();
  }

  // Подписка на сообщения
  subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}

export const wsManager = new WebSocketManager();