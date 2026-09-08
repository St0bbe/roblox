import { Sparkles, Users } from 'lucide-react';
import type { LiveStats, LiveViewer } from '../types/live';
import { Avatar } from './Avatar';

export function LiveStage({ viewers, biggest, stats }: { viewers: LiveViewer[]; biggest?: LiveViewer; stats: LiveStats }) {
  return (
    <section className="live-stage">
      <div className="top-bar">
        <div>
          <span className="live-pill">● LIVE</span>
          <h1>Roblox Dance Party</h1>
          <p>Comente para entrar • mande presente para crescer • siga para ganhar destaque</p>
        </div>
        <div className="viewer-count"><Users size={18} /> {124 + viewers.length}</div>
      </div>

      <div className="stats-row">
        <span>💬 {stats.comments}</span>
        <span>🎁 {stats.gifts}</span>
        <span>➕ {stats.follows}</span>
        <span>❤️ {stats.likes}</span>
      </div>

      <div className="spotlight">
        <div className="glow glow-a" />
        <div className="glow glow-b" />
        <div className="floor-grid" />
        <div className="stage-title">COMENTE PARA ENTRAR</div>
        <div className="characters">
          {viewers.map((viewer, index) => (
            <Avatar key={viewer.id} viewer={viewer} index={index} isLeader={biggest?.id === viewer.id} />
          ))}
        </div>

        {biggest && (
          <div className="leader-badge">
            <Sparkles size={16} /> Líder: @{biggest.username} · {biggest.scale.toFixed(2)}x
          </div>
        )}
      </div>
    </section>
  );
}
