import type { GiftTier } from '../types/live';

export type TikTokAdapterHandlers = {
  onComment: (payload: { username: string; displayName: string; avatarUrl?: string; message?: string }) => void;
  onGift: (payload: { username: string; displayName: string; avatarUrl?: string; giftTier: GiftTier; giftName: string; giftCount?: number }) => void;
  onFollow: (payload: { username: string; displayName: string; avatarUrl?: string }) => void;
  onLike: (payload: { username: string; displayName: string; avatarUrl?: string; likeCount?: number }) => void;
};

export type TikTokConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type StatusHandler = (status: TikTokConnectionStatus, message?: string) => void;

export class TikTokLiveAdapter {
  private socket?: WebSocket;
  private handlers: TikTokAdapterHandlers;
  private statusHandler?: StatusHandler;

  constructor(handlers: TikTokAdapterHandlers, statusHandler?: StatusHandler) {
    this.handlers = handlers;
    this.statusHandler = statusHandler;
  }

  connect(username: string) {
    return new Promise<void>((resolve, reject) => {
      const clean = username.trim().replace(/^@/, '');
      if (!clean) return reject(new Error('Informe seu @ do TikTok.'));
      this.disconnect();
      this.statusHandler?.('connecting');

      const socket = new WebSocket('ws://localhost:21213');
      this.socket = socket;

      socket.onopen = () => socket.send(JSON.stringify({ type: 'connect', username: clean }));
      socket.onerror = () => {
        this.statusHandler?.('error', 'Servidor local não encontrado. Rode npm run server em outro terminal.');
        reject(new Error('Servidor local não encontrado.'));
      };
      socket.onclose = () => this.statusHandler?.('disconnected');
      socket.onmessage = ({ data }) => {
        const message = JSON.parse(String(data));
        if (message.type === 'status') {
          this.statusHandler?.(message.status, message.message);
          if (message.status === 'connected') resolve();
          if (message.status === 'error') reject(new Error(message.message || 'Falha ao conectar.'));
          return;
        }
        if (message.type !== 'live-event') return;
        const event = message.event;
        if (event.type === 'comment') this.handlers.onComment(event);
        if (event.type === 'gift') this.handlers.onGift(event);
        if (event.type === 'follow') this.handlers.onFollow(event);
        if (event.type === 'like') this.handlers.onLike(event);
      };
    });
  }

  disconnect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'disconnect' }));
      this.socket.close();
    }
    this.socket = undefined;
  }
}
