import { Gift, Heart, MessageCircle, RotateCcw, UserPlus } from 'lucide-react';
import type { GiftTier, LiveEvent } from '../types/live';
import { EventFeed } from './EventFeed';

const names = ['Carlos', 'Maria', 'Lucas', 'Pedro', 'Lívia', 'Rafa', 'Nina', 'Gui'];

function randomUser() {
  const displayName = names[Math.floor(Math.random() * names.length)];
  return { username: `${displayName.toLowerCase()}${Math.floor(Math.random() * 99)}`, displayName };
}

export function Controls({
  events,
  onComment,
  onGift,
  onFollow,
  onLike,
  onReset,
}: {
  events: LiveEvent[];
  onComment: (payload: { username: string; displayName: string; message?: string }) => void;
  onGift: (payload: { username: string; displayName: string; giftTier: GiftTier; giftName: string; giftCount?: number }) => void;
  onFollow: (payload: { username: string; displayName: string }) => void;
  onLike: (payload: { username: string; displayName: string; likeCount?: number }) => void;
  onReset: () => void;
}) {
  function simulateComment() {
    const user = randomUser();
    onComment({ ...user, message: 'Quero entrar!' });
  }

  function simulateGift(tier: GiftTier) {
    const user = randomUser();
    const map = {
      rose: { giftName: 'Rosa', giftCount: 1 },
      medium: { giftName: 'Presente médio', giftCount: 1 },
      large: { giftName: 'Presente grande', giftCount: 1 },
    } as const;
    onComment({ ...user, message: 'Entrei na pista!' });
    setTimeout(() => onGift({ ...user, giftTier: tier, ...map[tier] }), 50);
  }

  function simulateFollow() {
    const user = randomUser();
    onFollow(user);
  }

  function simulateLike() {
    const user = randomUser();
    onLike({ ...user, likeCount: 25 });
  }

  return (
    <aside className="control-panel">
      <div>
        <p className="eyebrow">PAINEL DE TESTE</p>
        <h2>Simulação TikTok LIVE</h2>
        <p className="muted">Teste toda a mecânica antes de conectar a conta real.</p>
      </div>

      <button className="action-button comment" onClick={simulateComment}><MessageCircle size={19} /> Comentário</button>
      <div className="gift-buttons">
        <button onClick={() => simulateGift('rose')}><Gift size={17} /> Rosa</button>
        <button onClick={() => simulateGift('medium')}><Gift size={17} /> Médio</button>
        <button onClick={() => simulateGift('large')}><Gift size={17} /> Grande</button>
      </div>
      <button className="action-button follow" onClick={simulateFollow}><UserPlus size={19} /> Follow</button>
      <button className="action-button like" onClick={simulateLike}><Heart size={19} /> +25 likes</button>

      <EventFeed events={events} />

      <div className="rules-card">
        <strong>Regras atuais</strong>
        <span>💬 Comentário → entra na pista</span>
        <span>🌹 Rosa → cresce pouco</span>
        <span>🎁 Médio → cresce bastante</span>
        <span>👑 Grande → cresce muito e ganha destaque</span>
        <span>➕ Follow → marca como seguidor</span>
        <span>❤️ Likes → contabiliza interação</span>
      </div>

      <button className="reset-button" onClick={onReset}><RotateCcw size={16} /> Resetar simulação</button>
    </aside>
  );
}
