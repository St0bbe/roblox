import { Controls } from './components/Controls';
import { LiveStage } from './components/LiveStage';
import { useLiveEvents } from './hooks/useLiveEvents';

export default function App() {
  const live = useLiveEvents();

  return (
    <main className="app-shell">
      <LiveStage viewers={live.viewers} biggest={live.biggest} stats={live.stats} />
      <Controls
        events={live.events}
        onComment={live.comment}
        onGift={live.gift}
        onFollow={live.follow}
        onLike={live.like}
        onReset={live.reset}
      />
    </main>
  );
}
