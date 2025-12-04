import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRiderStore } from '@/store/useRiderStore';
import { useUserStore } from '@/store/use-user-store';
import { resetAndNavigate } from '@/utils/Helpers';
import axios from 'axios';
import { Alert } from 'react-native';
import { BASE_URL } from './config';
import { useAuthStore } from '@/store/auth-store';

export const signin = async (
  payload: {
    role: 'customer' | 'rider';
    phone: string;
  },
  updateAccessToken: () => void,
) => {
  const { setUser } = useUserStore.getState();
  const { setUser: setRiderUser } = useRiderStore.getState();

  try {
    const res = await axios.post(`${BASE_URL}/auth/signin`, payload);
    if (res.data.user.role === 'customer') {
      setUser(res.data.user);
    } else {
      setRiderUser(res.data.user);
    }

    useAuthStore.getState().setToken(res.data.access_token);

    if (res.data.user.role === 'customer') {
      resetAndNavigate('Tabs'); // Assuming 'Tabs' is for customer home
    } else {
      resetAndNavigate('Driver'); // Assuming 'Driver' is for rider home
    }

    updateAccessToken();
  } catch (error: any) {
    Alert.alert('Oh! Dang there was an error');
    console.log('Error: ', error?.response?.data?.msg || 'Error signin');
  }
};

export const logout = async (disconnect?: () => void) => {
  if (disconnect) {
    disconnect();
  }
  console.log('logout Called');
  const { clearData } = useUserStore.getState();
  const { clearRiderData } = useRiderStore.getState();

  await AsyncStorage.removeItem('authToken');
  useAuthStore.getState().clearToken();
  clearRiderData();
  clearData();
  resetAndNavigate('Auth'); // Navigate to Auth flow
};
