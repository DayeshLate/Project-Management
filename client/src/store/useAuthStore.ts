import { create } from 'zustand';
import { User } from '../types';
import { apiRequest } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('pm_auth_token'),
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('pm_auth_token', token);
    set({ user, token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('pm_auth_token');
    set({ user: null, token: null, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('pm_auth_token');
    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    try {
      const user = await apiRequest<User>('/auth/me');
      set({ user, token, isLoading: false });
    } catch (error) {
      localStorage.removeItem('pm_auth_token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
