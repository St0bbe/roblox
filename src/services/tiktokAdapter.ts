import type { GiftTier } from '../types/live';

export type TikTokAdapterHandlers = {
  onComment: (payload: { username: string; displayName: string; avatarUrl?: string; message?: string }) => void;
  onGift: (payload: { username: string; displayName: string; avatarUrl?: string; giftTier: GiftTier; giftName: string; giftCount?: number }) => void;
  onFollow: (payload: { username: string; displayName: string; avatarUrl?: string }) => void;
  onLike: (payload: { username: string; displayName: string; avatarUrl?: string; likeCount?: number }) => void;
};

/**
 * Camada de integração da fonte real do TikTok LIVE.
 *
 * A UI não depende de uma biblioteca específica. Quando escolhermos o conector
 * que receberá os eventos da live, basta traduzir os eventos dele para estes
 * quatro handlers.
 */
export class TikTokLiveAdapter {
  private handlers: TikTokAdapterHandlers;

  constructor(handlers: TikTokAdapterHandlers) {
    this.handlers = handlers;
  }

  async connect(_username: string) {
    throw new Error('Integração real com TikTok LIVE ainda não configurada. Use o painel de simulação.');
  }

  disconnect() {
    // Reservado para fechar socket/conexão da biblioteca escolhida.
  }

  get eventHandlers() {
    return this.handlers;
  }
}
