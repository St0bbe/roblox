import { useEffect, useRef, useState } from 'react';
import type { GiftTier } from '../types/live';

type Status = 'offline' | 'bridge-connected' | 'connecting' | 'connected' | 'error';

type Handlers = {
  onComment: (payload: { username: string; displayName: string; avatarUrl?: string; message?: string }) => void;
  onGift: (payload: { username: string; displayName: string; avatarUrl?: string; giftTier: GiftTier; giftName: string; giftCount?: number }) => void;
  onFollow: (payload: { username: string; displayName: string; avatarUrl?: string }) => void;
  onLike: (payload: { username: string; displayName: string; avatarUrl?: string; likeCount?: number }) => void;
};

const BRIDGE_URL = 'ws://localhost:21213';

export function useTikTokLiveBridge(handlers: Handlers) {
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(handlers);
  const [status, setStatus] = useState<Status>('offline');
  const [connectedUsername, setConnectedUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  handlersRef.current = handlers;

  useEffect(() => {
    let reconnectTimer: number | undefined;
    let disposed = false;

    const openSocket = () => {
      if (disposed) return;
      const socket = new WebSocket(BRIDGE_URL);
      socketRef.current = socket;

      socket.addEventListener('open', () => {
        setStatus((current) => current === 'connected' ? current : 'bridge-connected');
        setErrorMessage('');
      });

      socket.addEventListener('message', (message) => {
        try {
          const payload = JSON.parse(String(message.data));

          if (payload.type === 'status') {
            if (payload.status === 'connected') {
              setStatus('connected');
              setConnectedUsername(payload.username || '');
              setErrorMessage('');
            } else if (payload.status === 'connecting') {
              setStatus('connecting');
              setConnectedUsername(payload.username || '');
              setErrorMessage('');
            } else if (payload.status === 'error') {
              setStatus('error');
              setErrorMessage(payload.message || 'Erro ao conectar com a LIVE.');
            } else {
              setStatus('bridge-connected');
              setConnectedUsername('');
            }
            return;
          }

          if (payload.type !== 'live-event' || !payload.event) return;
          const event = payload.event;
          const current = handlersRef.current;

          if (event.type === 'comment') current.onComment(event);
          if (event.type === 'gift') current.onGift(event);
          if (event.type === 'follow') current.onFollow(event);
          if (event.type === 'like') current.onLike(event);
        } catch (error) {
          console.error('Evento inválido do bridge TikTok:', error);
        }
      });

      socket.addEventListener('close', () => {
        if (disposed) return;
        setStatus('offline');
        setConnectedUsername('');
        reconnectTimer = window.setTimeout(openSocket, 1500);
      });

      socket.addEventListener('error', () => {
        if (!disposed) {
          setStatus('offline');
          setErrorMessage('Backend desconectado. Verifique se npm run server está aberto.');
        }
      });
    };

    openSocket();

    return () => {
      disposed = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, []);

  function connect(username: string) {
    const clean = username.trim().replace(/^@/, '');
    if (!clean) {
      setStatus('error');
      setErrorMessage('Informe o @ da conta TikTok.');
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setStatus('error');
      setErrorMessage('Backend desconectado. Rode npm run server primeiro.');
      return;
    }

    setStatus('connecting');
    setErrorMessage('');
    socketRef.current.send(JSON.stringify({ type: 'connect', username: clean }));
  }

  function disconnect() {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'disconnect' }));
    }
  }

  return { status, connectedUsername, errorMessage, connect, disconnect };
}
