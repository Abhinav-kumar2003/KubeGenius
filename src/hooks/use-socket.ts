import { useEffect, useRef, useState } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws';

export function useWebSocket<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = `${WS_BASE_URL}${path}`;
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`WebSocket Connected: ${url}`);
      setIsConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setData(message.data);
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    socket.onerror = (err) => {
      console.error(`WebSocket Error: ${url}`, err);
      setError(err);
      setIsConnected(false);
    };

    socket.onclose = () => {
      console.log(`WebSocket Disconnected: ${url}`);
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [path]);

  const sendMessage = (message: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return { data, isConnected, error, sendMessage };
}
