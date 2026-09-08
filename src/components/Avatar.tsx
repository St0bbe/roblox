import type { CSSProperties } from 'react';
import type { LiveViewer } from '../types/live';

export function Avatar({ viewer, index, isLeader }: { viewer: LiveViewer; index: number; isLeader: boolean }) {
  const highlighted = Boolean(viewer.highlightUntil && viewer.highlightUntil > Date.now());
  const style = {
    '--avatar-scale': Math.min(viewer.scale, 2.25),
    '--dance-delay': `${index * 0.1}s`,
  } as CSSProperties;

  return (
    <div className={`character-card dancing ${highlighted ? 'gift-highlight' : ''}`} style={style}>
      {isLeader && <div className="crown">👑</div>}
      <div className="avatar-head">
        {viewer.avatarUrl ? <img src={viewer.avatarUrl} alt={viewer.displayName} /> : viewer.displayName.charAt(0).toUpperCase()}
      </div>
      <div className="avatar-body">
        <span className="arm left" />
        <span className="torso" />
        <span className="arm right" />
        <span className="leg left-leg" />
        <span className="leg right-leg" />
      </div>
      <div className="name-tag">@{viewer.username}</div>
      <div className="mini-stats">🎁 {viewer.gifts} · ❤️ {viewer.likes}</div>
    </div>
  );
}
