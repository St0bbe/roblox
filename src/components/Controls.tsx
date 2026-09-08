import { useState } from 'react';
import { Gift, Heart, Link2, MessageCircle, Power, RotateCcw, UserPlus, Wifi } from 'lucide-react';
import type { GiftTier, LiveEvent } from '../types/live';
import { EventFeed } from './EventFeed';

const names = ['Carlos', 'Maria', 'Lucas', 'Pedro', 'Lívia', 'Rafa', 'Nina', 'Gui'];

function randomUser() {
  const displayName = names[Math.floor(Math.random() * names.length)];
  return { username: `${displayName.toLowerCase()}${Math.floor(Math.random() * 99)}`, displayName };
}

type LiveStatus = 'offline' | 'bridge-connected' | 'connecting' | 'connected' | 'error';

export function Controls({
  events,
  onComment,
  onGift,
  onFollow,
  onLike,
  onReset,
  liveStatus,
  connectedUsername,
  liveError,
  onConnectLive,
  onDisconnectLive,
}: {
  events: LiveEvent[];
  onComment: (payload: { username: string; displayName: string; message?: string }) => void;
  onGift: (payload: { username: string; displayName: string; giftTier: GiftTier; giftName: string; giftCount?: number }) => void;
  onFollow: (payload: { username: string; displayName: string }) => void;
  onLike: (payload: { username: string; displayName: string; likeCount?: number }) => void;
  onReset: () => void;
  liveStatus: LiveStatus;
  connectedUsername: string;
  liveError: string;
  onConnectLive: (username: string) => void;
  onDisconnectLive: () => void;
}) {
  const [username, setUsername] = useState('');

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

  const connected = liveStatus === 'connected';
  const bridgeReady = liveStatus !== 'offline';

  const statusText = connected
    ? `AO VIVO COM @${connectedUsername}`
    : liveStatus === 'connecting'
      ? 'CONECTANDO...'
      : liveStatus === 'bridge-connected'
        ? 'BACKEND PRONTO'
        : liveStatus === 'error'
          ? 'ERRO NA CONEXÃO'
          : 'BACKEND OFFLINE';

  return (
    <aside className="control-panel">
      <div>
        <p className="eyebrow">TIKTOK LIVE</p>
        <h2>Conexão da Live</h2>
        <p className="muted">Conecte pelo @ da conta que já estiver transmitindo.</p>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, padding: 14, background: 'rgba(255,255,255,.035)', display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 900, color: connected ? '#4ade80' : bridgeReady ? '#facc15' : '#fb7185' }}>
          <Wifi size={15} /> {statusText}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 11, padding: '0 11px' }}>
            <span style={{ color: '#111827', fontWeight: 900 }}>@</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && !connected) onConnectLive(username); }}
              placeholder="seu_usuario_tiktok"
              disabled={connected || liveStatus === 'connecting'}
              style={{ width: '100%', minWidth: 0, border: 0, outline: 0, padding: '12px 0', background: 'transparent', color: '#111827', fontWeight: 700 }}
            />
          </div>
        </div>

        {!connected ? (
          <button
            className="action-button follow"
            onClick={() => onConnectLive(username)}
            disabled={liveStatus === 'connecting' || liveStatus === 'offline'}
            style={{ opacity: liveStatus === 'offline' ? 0.5 : 1 }}
          >
            <Link2 size={18} /> {liveStatus === 'connecting' ? 'Conectando...' : 'Conectar à LIVE'}
          </button>
        ) : (
          <button className="action-button like" onClick={onDisconnectLive}>
            <Power size={18} /> Desconectar LIVE
          </button>
        )}

        {liveError && <div style={{ fontSize: 11, lineHeight: 1.4, color: '#fda4af' }}>{liveError}</div>}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,.09)', paddingTop: 14 }}>
        <p className="eyebrow">PAINEL DE TESTE</p>
        <p className="muted">A simulação continua disponível para desenvolvimento.</p>
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
