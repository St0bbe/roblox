import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Gift, MessageCircle, Users, Sparkles } from 'lucide-react';
import './styles.css';

type Viewer = {
  id: number;
  name: string;
  avatar: string;
  scale: number;
};

const starterViewers: Viewer[] = [
  { id: 1, name: 'Ana', avatar: 'A', scale: 1 },
  { id: 2, name: 'João', avatar: 'J', scale: 1.15 },
  { id: 3, name: 'Bia', avatar: 'B', scale: 0.95 },
];

function App() {
  const [viewers, setViewers] = useState(starterViewers);
  const [events, setEvents] = useState<string[]>(['Sistema pronto para simular eventos da LIVE']);
  const [nextId, setNextId] = useState(4);

  const biggest = useMemo(() => [...viewers].sort((a, b) => b.scale - a.scale)[0], [viewers]);

  function addComment() {
    const names = ['Carlos', 'Maria', 'Lucas', 'Pedro', 'Lívia', 'Rafa'];
    const name = names[Math.floor(Math.random() * names.length)];
    const newViewer: Viewer = { id: nextId, name, avatar: name[0], scale: 1 };
    setNextId((value) => value + 1);
    setViewers((current) => [...current.slice(-7), newViewer]);
    setEvents((current) => [`💬 ${name} comentou e entrou na pista`, ...current].slice(0, 6));
  }

  function sendGift() {
    if (!viewers.length) return;
    const target = viewers[Math.floor(Math.random() * viewers.length)];
    setViewers((current) =>
      current.map((viewer) => viewer.id === target.id ? { ...viewer, scale: Math.min(viewer.scale + 0.45, 3.2) } : viewer)
    );
    setEvents((current) => [`🎁 ${target.name} enviou presente e cresceu`, ...current].slice(0, 6));
  }

  return (
    <main className="app-shell">
      <section className="live-stage">
        <div className="top-bar">
          <div>
            <span className="live-pill">● LIVE</span>
            <h1>Dance Party</h1>
            <p>Comente para entrar • envie presente para crescer</p>
          </div>
          <div className="viewer-count"><Users size={18} /> {124 + viewers.length}</div>
        </div>

        <div className="spotlight">
          <div className="glow glow-a" />
          <div className="glow glow-b" />
          <div className="floor-grid" />
          <div className="characters">
            {viewers.map((viewer, index) => (
              <div
                className="character-card dancing"
                key={viewer.id}
                style={{ transform: `scale(${viewer.scale})`, animationDelay: `${index * 0.12}s` }}
              >
                <div className="avatar-head">{viewer.avatar}</div>
                <div className="avatar-body">
                  <span className="arm left" />
                  <span className="torso" />
                  <span className="arm right" />
                  <span className="leg left-leg" />
                  <span className="leg right-leg" />
                </div>
                <div className="name-tag">@{viewer.name.toLowerCase()}</div>
              </div>
            ))}
          </div>

          {biggest && <div className="leader-badge"><Sparkles size={16} /> Maior avatar: @{biggest.name.toLowerCase()}</div>}
        </div>
      </section>

      <aside className="control-panel">
        <div>
          <p className="eyebrow">PAINEL DE TESTE</p>
          <h2>Simulação TikTok LIVE</h2>
          <p className="muted">Enquanto a integração real não está ligada, estes botões simulam comentário e presente.</p>
        </div>

        <button className="action-button comment" onClick={addComment}>
          <MessageCircle size={20} /> Simular comentário
        </button>
        <button className="action-button gift" onClick={sendGift}>
          <Gift size={20} /> Simular presente
        </button>

        <div className="event-log">
          <p className="eyebrow">EVENTOS</p>
          {events.map((event, index) => <div className="event-item" key={`${event}-${index}`}>{event}</div>)}
        </div>

        <div className="rules-card">
          <strong>Primeiras regras</strong>
          <span>💬 Comentou → entra na pista</span>
          <span>🎁 Presente → avatar cresce</span>
          <span>👑 Maior avatar → destaque automático</span>
        </div>
      </aside>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
