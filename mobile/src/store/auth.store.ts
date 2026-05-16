import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/auth';

// expo-secure-store ne fonctionne pas sur web, on fallback sur localStorage
const storage = {
  get: (key: string) => Platform.OS === 'web' ? localStorage.getItem(key) : SecureStore.getItemAsync(key),
  set: (key: string, value: string) => Platform.OS === 'web' ? (localStorage.setItem(key, value), Promise.resolve()) : SecureStore.setItemAsync(key, value),
  del: (key: string) => Platform.OS === 'web' ? (localStorage.removeItem(key), Promise.resolve()) : SecureStore.deleteItemAsync(key),
};

type User = { id: string; email: string; name: string; globalXp: number; globalLevel: number; streakCount: number; avatarUrl: string | null };

type AuthStore = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  loadFromStorage: async () => {
    const token = await storage.get('token');
    if (token) {
      try {
        const user = await authApi.me();
        set({ token, user, isLoading: false });
      } catch {
        await storage.del('token');
        set({ token: null, user: null, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { access_token } = await authApi.login({ email, password });
    await storage.set('token', access_token);
    const user = await authApi.me();
    set({ token: access_token, user });
  },

  register: async (email, password, name) => {
    const { access_token } = await authApi.register({ email, password, name });
    await storage.set('token', access_token);
    const user = await authApi.me();
    set({ token: access_token, user });
  },

  logout: async () => {
    await storage.del('token');
    set({ token: null, user: null });
  },

  refreshUser: async () => {
    const user = await authApi.me();
    set({ user });
  },
}));
