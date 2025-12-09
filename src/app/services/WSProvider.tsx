import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { SOCKET_URL } from './config';

type Listener = (data: any) => void;

interface WSService {
  emit: (event: string, data?: any) => void;
  on: (event: string, cb: Listener) => void;
  off: (event: string) => void;
  disconnect: () => void;
}

const WSContext = createContext<WSService | undefined>(undefined);

export const WSProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useRef<WebSocket | null>(null);
  const listeners = useRef<Record<string, Listener[]>>({});

  // -----------------------------
  // EVENT LISTENER REGISTRATION
  // -----------------------------
  const on = useCallback((event: string, cb: Listener) => {
    if (!listeners.current[event]) listeners.current[event] = [];
    listeners.current[event].push(cb);
  }, []);

  const off = useCallback((event: string) => {
    listeners.current[event] = [];
  }, []);

  const triggerEvent = useCallback((event: string, data: any) => {
    const eventListeners = listeners.current[event];
    if (eventListeners) eventListeners.forEach(cb => cb(data));
  }, []);

  // -----------------------------
  // WS CONNECTION SETUP
  // -----------------------------
  useEffect(() => {
    const wsUrl = SOCKET_URL.replace(/^http/, 'ws') + '/ws';
    console.log('Connecting WebSocket →', wsUrl);

    socket.current = new WebSocket(wsUrl);

    socket.current.onopen = () => {
      console.log('WebSocket connected');
      triggerEvent('connect', null);
    };

    socket.current.onmessage = event => {
      try {
        const json = JSON.parse(event.data);

        // Custom event system
        if (json.event) triggerEvent(json.event, json.data);
        else triggerEvent('message', json);
      } catch {
        // Raw message (like our open server sends: "Echo: ...")
        triggerEvent('message', event.data);
      }
    };

    socket.current.onerror = error => {
      console.log('WebSocket error:', error);
      triggerEvent('connect_error', error);
    };

    socket.current.onclose = () => {
      console.log('WebSocket disconnected');
      triggerEvent('disconnect', null);
    };

    return () => {
      socket.current?.close();
    };
  }, []);

  // -----------------------------
  // EMIT EVENTS TO SERVER
  // -----------------------------
  const emit = (event: string, data: any = {}) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ event, data }));
    } else {
      console.log('WS not ready, cannot emit');
    }
  };

  // -----------------------------
  // MANUAL DISCONNECT
  // -----------------------------
  const disconnect = () => {
    socket.current?.close();
  };

  const socketService: WSService = {
    emit,
    on,
    off,
    disconnect,
  };

  return (
    <WSContext.Provider value={socketService}>{children}</WSContext.Provider>
  );
};

export const useWS = (): WSService => {
  const socketService = useContext(WSContext);
  if (!socketService) throw new Error('useWS must be used inside a WSProvider');
  return socketService;
};
