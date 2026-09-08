import { WebSocketServer } from 'ws';
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const PORT = Number(process.env.LIVE_BRIDGE_PORT || 21213);
const wss = new WebSocketServer({ port: PORT });
let connection = null;
let connectedUsername = null;

function broadcast(payload) {
  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(message);
  }
}

function userFrom(data) {
  const user = data?.user || {};
  return {
    username: user.uniqueId || user.unique_id || String(user.userId || user.user_id || 'viewer'),
    displayName: user.nickname || user.uniqueId || user.unique_id || 'Viewer',
    avatarUrl: user.profilePicture?.urls?.[0] || user.avatarThumb?.urlList?.[0] || user.avatar_thumb?.url_list?.[0],
  };
}

function giftTier(data) {
  const diamonds = Number(data?.giftDetails?.diamondCount ?? data?.gift?.diamond_count ?? data?.diamondCount ?? 0);
  if (diamonds >= 100) return 'large';
  if (diamonds >= 10) return 'medium';
  return 'rose';
}

async function disconnectTikTok() {
  if (connection) {
    try { connection.disconnect(); } catch {}
  }
  connection = null;
  connectedUsername = null;
  broadcast({ type: 'status', status: 'disconnected' });
}

async function connectTikTok(rawUsername) {
  const username = String(rawUsername || '').trim().replace(/^@/, '');
  if (!username) throw new Error('Informe o @username do TikTok.');
  await disconnectTikTok();

  broadcast({ type: 'status', status: 'connecting', username });
  const live = new TikTokLiveConnection(username, { enableExtendedGiftInfo: true });
  connection = live;

  live.on(WebcastEvent.CHAT, (data) => {
    broadcast({ type: 'live-event', event: { type: 'comment', ...userFrom(data), message: data.comment || '' } });
  });

  live.on(WebcastEvent.GIFT, (data) => {
    // Streak gifts emit updates while the combo is running. Process only the final repeat event.
    if (data.giftType === 1 && !data.repeatEnd) return;
    const count = Number(data.repeatCount || 1);
    broadcast({
      type: 'live-event',
      event: {
        type: 'gift',
        ...userFrom(data),
        giftTier: giftTier(data),
        giftName: data.giftDetails?.giftName || data.gift?.name || 'Presente',
        giftCount: count,
      },
    });
  });

  live.on(WebcastEvent.LIKE, (data) => {
    broadcast({ type: 'live-event', event: { type: 'like', ...userFrom(data), likeCount: Number(data.likeCount || data.count || 1) } });
  });

  live.on(WebcastEvent.SOCIAL, (data) => {
    const label = String(data.displayType || data.label || '').toLowerCase();
    if (label.includes('follow')) broadcast({ type: 'live-event', event: { type: 'follow', ...userFrom(data) } });
  });

  live.on('disconnected', () => {
    if (connection === live) {
      connection = null;
      connectedUsername = null;
      broadcast({ type: 'status', status: 'disconnected' });
    }
  });

  live.on('error', (error) => {
    broadcast({ type: 'status', status: 'error', message: error?.message || String(error) });
  });

  const state = await live.connect();
  connectedUsername = username;
  broadcast({ type: 'status', status: 'connected', username, roomId: state?.roomId });
}

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({
    type: 'status',
    status: connection ? 'connected' : 'disconnected',
    username: connectedUsername,
  }));

  socket.on('message', async (buffer) => {
    try {
      const message = JSON.parse(buffer.toString());
      if (message.type === 'connect') await connectTikTok(message.username);
      if (message.type === 'disconnect') await disconnectTikTok();
    } catch (error) {
      socket.send(JSON.stringify({ type: 'status', status: 'error', message: error?.message || String(error) }));
    }
  });
});

console.log(`TikTok LIVE bridge: ws://localhost:${PORT}`);
