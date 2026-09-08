import { Sparkles, Users } from 'lucide-react';
import type { LiveStats, LiveViewer } from '../types/live';
import { LiveStage3D } from './LiveStage3D';

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

      <div className="spotlight spotlight-3d">
        <div className="stage-title">COMENTE PARA ENTRAR</div>
        <LiveStage3D viewers={viewers} biggest={biggest} />

        {biggest && (
          <div className="leader-badge">
            <Sparkles size={16} /> Líder: @{biggest.username} · {biggest.scale.toFixed(2)}x
          </div>
        )}
      </div>
    </section>
  );
}
