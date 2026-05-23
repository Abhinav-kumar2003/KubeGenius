import { useEffect, useRef, useState, useCallback } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws';
const MAX_RETRIES = 5;

export function useWebSocket<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const pathRef = useRef(path);
  pathRef.current = path;

  // Stable connect function
  const connect = useCallback(function connect() {
    const url = `${WS_BASE_URL}${pathRef.current}`;

    // Clean up any existing socket
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      if (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      ) {
        socketRef.current.close();
      }
    }

    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) return;
      console.log(`WebSocket Connected: ${url}`);
      retryCountRef.current = 0;
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      try {
        const message = JSON.parse(event.data);
        setData(message.data ?? message);
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    ws.onerror = (err) => {
      if (!isMountedRef.current) return;
      setError(err);
      setIsConnected(false);
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      setIsConnected(false);

      if (retryCountRef.current < MAX_RETRIES) {
        const delay = Math.min(Math.pow(2, retryCountRef.current) * 1000, 30000);
        retryCountRef.current += 1;
        console.log(
          `WebSocket reconnecting in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES}): ${url}`
        );

      retryTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) connect();
        }, delay);
      } else {
        console.warn(`WebSocket max retries reached for: ${url}`);
      }
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    retryCountRef.current = 0;
    connect();

    return () => {
      isMountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [path, connect]);

  const sendMessage = (message: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return { data, isConnected, error, sendMessage };
}
