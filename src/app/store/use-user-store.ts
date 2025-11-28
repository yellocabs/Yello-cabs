import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Role = 'rider' | 'captain' | null;

type UserState = {
  role: Role;
  setRole: (newRole: Role) => void;
  resetRole: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (newRole) => set({ role: newRole }),
      resetRole: () => set({ role: null }),
    }),
    {
      name: 'user-role-storage', // 👈 key in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
