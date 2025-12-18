import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './config';
import { useAuthStore } from '@/store/auth-store';

interface WSService {
  emit: (event: string, data?: any) => void;
  on: (event: string, cb: (...args: any[]) => void) => void;
  off: (event: string, cb?: (...args: any[]) => void) => void;
  disconnect: () => void;
  isConnected: () => boolean;
}

const WSContext = createContext<WSService | undefined>(undefined);

export const WSProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = useAuthStore(state => state.token);
  const socketRef = useRef<Socket | null>(null);

  /** -------------------------------
   * Initialize socket (ONCE per token)
   --------------------------------*/
  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    if (socketRef.current) return;

    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: {
        access_token: token,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });
    socket.onAny((event, ...args) => {
      console.log('📥 SOCKET EVENT FROM BACKEND:', event, args);
    });

    socket.on('connected', data => {
      console.log('🟢 Backend handshake confirmed:', data);
    });

    socket.on('disconnect', reason => {
      console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', err => {
      console.error('❌ Socket connect error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  /** -------------------------------
   * SAFE EMIT (DO NOT BLOCK)
   --------------------------------*/
  const emit = (event: string, data?: any) => {
    if (!socketRef.current) {
      console.warn(`⚠️ Emit failed (no socket): ${event}`);
      return;
    }
    socketRef.current.emit(event, data);
  };

  const on = (event: string, cb: (...args: any[]) => void) => {
    socketRef.current?.on(event, cb);
  };

  const off = (event: string, cb?: (...args: any[]) => void) => {
    socketRef.current?.off(event, cb);
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  };

  const isConnected = () => {
    return !!socketRef.current?.connected;
  };

  return (
    <WSContext.Provider
      value={{
        emit,
        on,
        off,
        disconnect,
        isConnected,
      }}
    >
      {children}
    </WSContext.Provider>
  );
};

export const useWS = () => {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error('useWS must be used within WSProvider');
  return ctx;
};
