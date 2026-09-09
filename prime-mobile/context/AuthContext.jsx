import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import authService from '../services/auth.service';
import api from '../services/api';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

const TOKEN_KEY = 'prime_auth_token';
const USER_KEY = 'prime_auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for cross-platform secure storage
  const getItem = async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  };

  const setItem = async (key, val) => {
    try {
      if (val) {
        await SecureStore.setItemAsync(key, val);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      console.warn('SecureStore error:', e);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await getItem(TOKEN_KEY);
        const savedUserJson = await getItem(USER_KEY);

        if (savedToken) {
          setToken(savedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

          if (savedUserJson) {
            setUser(JSON.parse(savedUserJson));
          }

          // Verify with backend
          try {
            const freshUser = await authService.getMe();
            setUser(freshUser);
            await setItem(USER_KEY, JSON.stringify(freshUser));
          } catch (err) {
            console.warn('Session verification failed, logging out', err);
            await logout();
          }
        }
      } catch (e) {
        console.error('Failed to load auth session:', e);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const authToken = data.token;
    const authUser = data.user;

    setToken(authToken);
    setUser(authUser);

    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    await setItem(TOKEN_KEY, authToken);
    await setItem(USER_KEY, JSON.stringify(authUser));

    return authUser;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    await setItem(TOKEN_KEY, null);
    await setItem(USER_KEY, null);
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      await setItem(USER_KEY, JSON.stringify(freshUser));
      return freshUser;
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isFarmer: user?.role === 'farmer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
