import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from SecureStore to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('prime_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // SecureStore may not be available in all environments
    console.warn('SecureStore read error:', e.message);
  }
  return config;
});

// Handle 401 responses globally
let logoutHandler = null;

export function setLogoutHandler(handler) {
  logoutHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('prime_token');
      } catch (e) {
        // ignore
      }
      if (logoutHandler) logoutHandler();
    }
    return Promise.reject(error);
  }
);

export default api;
