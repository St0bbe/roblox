import { Controls } from './components/Controls';
import { LiveStage } from './components/LiveStage';
import { useLiveEvents } from './hooks/useLiveEvents';
import { useTikTokLiveBridge } from './hooks/useTikTokLiveBridge';

export default function App() {
  const live = useLiveEvents();
  const bridge = useTikTokLiveBridge({
    onComment: live.comment,
    onGift: live.gift,
    onFollow: live.follow,
    onLike: live.like,
  });

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
        liveStatus={bridge.status}
        connectedUsername={bridge.connectedUsername}
        liveError={bridge.errorMessage}
        onConnectLive={bridge.connect}
        onDisconnectLive={bridge.disconnect}
      />
    </main>
  );
}
