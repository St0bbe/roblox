import { useMemo, useState } from 'react';
import type { GiftTier, LiveEvent, LiveStats, LiveViewer } from '../types/live';

const MAX_VIEWERS = 12;
const MAX_EVENTS = 10;

const starterViewers: LiveViewer[] = [
  { id: 'ana', username: 'ana', displayName: 'Ana', scale: 1, gifts: 0, likes: 0, isFollowing: false, joinedAt: Date.now() - 3000 },
  { id: 'joao', username: 'joao', displayName: 'João', scale: 1.15, gifts: 1, likes: 0, isFollowing: true, joinedAt: Date.now() - 2000 },
  { id: 'bia', username: 'bia', displayName: 'Bia', scale: 0.95, gifts: 0, likes: 2, isFollowing: false, joinedAt: Date.now() - 1000 },
];

const initialStats: LiveStats = { comments: 0, gifts: 1, follows: 1, likes: 2 };

function eventId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function scaleForGift(tier: GiftTier, count = 1) {
  const base = tier === 'large' ? 1.15 : tier === 'medium' ? 0.55 : 0.22;
  return base * Math.max(1, Math.min(count, 5));
}

function effectDuration(tier: GiftTier) {
  if (tier === 'large') return 6500;
  if (tier === 'medium') return 4200;
  return 2600;
}

export function useLiveEvents() {
  const [viewers, setViewers] = useState<LiveViewer[]>(starterViewers);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [stats, setStats] = useState<LiveStats>(initialStats);

  const biggest = useMemo(
    () => [...viewers].sort((a, b) => b.scale - a.scale)[0],
    [viewers],
  );

  function pushEvent(event: Omit<LiveEvent, 'id' | 'createdAt'>) {
    const fullEvent: LiveEvent = { ...event, id: eventId(), createdAt: Date.now() };
    setEvents((current) => [fullEvent, ...current].slice(0, MAX_EVENTS));
    return fullEvent;
  }

  function ensureViewer(event: Pick<LiveEvent, 'username' | 'displayName' | 'avatarUrl'>) {
    setViewers((current) => {
      if (current.some((viewer) => viewer.username === event.username)) return current;
      const next: LiveViewer = {
        id: event.username,
        username: event.username,
        displayName: event.displayName,
        avatarUrl: event.avatarUrl,
        scale: 1,
        gifts: 0,
        likes: 0,
        isFollowing: false,
        joinedAt: Date.now(),
      };
      return [...current, next].slice(-MAX_VIEWERS);
    });
  }

  function comment(payload: Pick<LiveEvent, 'username' | 'displayName' | 'avatarUrl' | 'message'>) {
    ensureViewer(payload);
    pushEvent({ type: 'comment', ...payload });
    setStats((current) => ({ ...current, comments: current.comments + 1 }));
  }

  function gift(payload: Pick<LiveEvent, 'username' | 'displayName' | 'avatarUrl'> & { giftTier: GiftTier; giftName: string; giftCount?: number }) {
    ensureViewer(payload);
    const count = payload.giftCount ?? 1;
    const growth = scaleForGift(payload.giftTier, count);
    const now = Date.now();
    const giftEffectUntil = now + effectDuration(payload.giftTier);
    const highlightUntil = payload.giftTier === 'large' ? giftEffectUntil : undefined;

    setViewers((current) => current.map((viewer) =>
      viewer.username === payload.username
        ? {
            ...viewer,
            scale: Math.min(4.2, viewer.scale + growth),
            gifts: viewer.gifts + count,
            avatarUrl: payload.avatarUrl ?? viewer.avatarUrl,
            highlightUntil,
            giftEffectTier: payload.giftTier,
            giftEffectUntil,
          }
        : viewer,
    ));

    pushEvent({ type: 'gift', ...payload, giftCount: count });
    setStats((current) => ({ ...current, gifts: current.gifts + count }));
  }

  function follow(payload: Pick<LiveEvent, 'username' | 'displayName' | 'avatarUrl'>) {
    ensureViewer(payload);
    setViewers((current) => current.map((viewer) =>
      viewer.username === payload.username ? { ...viewer, isFollowing: true } : viewer,
    ));
    pushEvent({ type: 'follow', ...payload });
    setStats((current) => ({ ...current, follows: current.follows + 1 }));
  }

  function like(payload: Pick<LiveEvent, 'username' | 'displayName' | 'avatarUrl'> & { likeCount?: number }) {
    ensureViewer(payload);
    const count = payload.likeCount ?? 1;
    setViewers((current) => current.map((viewer) =>
      viewer.username === payload.username ? { ...viewer, likes: viewer.likes + count } : viewer,
    ));
    pushEvent({ type: 'like', ...payload, likeCount: count });
    setStats((current) => ({ ...current, likes: current.likes + count }));
  }

  function reset() {
    setViewers(starterViewers);
    setEvents([]);
    setStats(initialStats);
  }

  return { viewers, events, stats, biggest, comment, gift, follow, like, reset };
}
