import axios from 'axios';
import Config from 'react-native-config';
import { useUserStore } from '@/store/use-user-store';

const api = axios.create({
  baseURL: Config.BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = useUserStore.getState().user?.token;
  console.log(token);
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
