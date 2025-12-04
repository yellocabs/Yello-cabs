import axios from 'axios';
import { BASE_URL } from './config';
import { useAuthStore } from '../store/auth-store';
import { logout } from './authService';

export const appAxios = axios.create({
  baseURL: BASE_URL,
});

appAxios.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

appAxios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized, logging out.');
      logout();
    }
    return Promise.reject(error);
  },
);
