import { useAuthStore } from '../store/auth-store';
import { useUserStore } from '../store/use-user-store';

export const logout = () => {
  useAuthStore.getState().clearToken();
  useUserStore.getState().clearData();
};
