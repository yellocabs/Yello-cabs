// src/store/use-auth-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: 'auth-storage', // key in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
