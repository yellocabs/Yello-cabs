import axios from 'axios';
import Config from 'react-native-config';
import { useUserStore } from '@/store/use-user-store';
import { BASE_URL } from '@/services/config';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});
api.interceptors.request.use(config => {
  const token = useUserStore.getState().user?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  response => response,
  error => {
    console.log('API Error:', error.response?.data || error.message);

    // optional: auto logout on 401
    if (error.response?.status === 401) {
      useUserStore.getState().clearData();
    }

    return Promise.reject(error);
  },
);

export default api;
