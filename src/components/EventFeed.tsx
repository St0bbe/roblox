import type { LiveEvent } from '../types/live';

function describe(event: LiveEvent) {
  if (event.type === 'comment') return `💬 ${event.displayName}: ${event.message || 'entrou na pista'}`;
  if (event.type === 'gift') return `🎁 ${event.displayName} enviou ${event.giftName || 'presente'} x${event.giftCount || 1}`;
  if (event.type === 'follow') return `➕ ${event.displayName} começou a seguir`;
  return `❤️ ${event.displayName} enviou ${event.likeCount || 1} like(s)`;
}

export function EventFeed({ events }: { events: LiveEvent[] }) {
  return (
    <div className="event-log">
      <p className="eyebrow">EVENTOS</p>
      {events.length === 0 && <div className="event-empty">Aguardando eventos da LIVE...</div>}
      {events.map((event) => (
        <div className={`event-item event-${event.type}`} key={event.id}>{describe(event)}</div>
      ))}
    </div>
  );
}
