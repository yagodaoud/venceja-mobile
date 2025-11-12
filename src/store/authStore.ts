import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => Promise<void>;
  setTokens: (token: string, refreshToken?: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user: User, token: string, refreshToken?: string) => {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    if (refreshToken) {
      await SecureStore.setItemAsync('refresh_token', refreshToken);
      set({ user, token, refreshToken, isAuthenticated: true });
    } else {
      set({ user, token, isAuthenticated: true });
    }
  },

  setTokens: async (token: string, refreshToken?: string) => {
    await SecureStore.setItemAsync('auth_token', token);
    if (refreshToken) {
      await SecureStore.setItemAsync('refresh_token', refreshToken);
      set({ token, refreshToken });
    } else {
      set({ token });
    }
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      const userStr = await SecureStore.getItemAsync('auth_user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        set({ user, token, refreshToken, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },
}));

