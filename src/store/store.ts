'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * 用户接口
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credits: number;
}

/**
 * 全局状态接口
 */
export interface GlobalState {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;

  // 应用状态
  isLoading: boolean;
  error: string | null;

  // UI状态
  sidebarOpen: boolean;
}

/**
 * 全局状态和动作接口
 */
export interface GlobalStore extends GlobalState {
  // 用户相关动作
  setUser: (user: User | null) => void;

  // 应用状态相关动作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // UI状态相关动作
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
}

/**
 * 初始状态
 */
const initialState: GlobalState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sidebarOpen: true
};

/**
 * 创建全局状态store
 */
export const useGlobalStore = create<GlobalStore>()(
  devtools(
    (set) => ({
      ...initialState,

      // 动作
      setUser: user => set({ user, isAuthenticated: !!user }),
      setLoading: loading => set({ isLoading: loading }),
      setError: error => set({ error, isLoading: false }),
      clearError: () => set({ error: null }),
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebar: open => set({ sidebarOpen: open })
    }),
    { name: 'global-store' }
  )
);

// 简化的选择器hooks
export const useUser = () => useGlobalStore(state => state.user);
export const useIsAuthenticated = () => useGlobalStore(state => state.isAuthenticated);
export const useIsLoading = () => useGlobalStore(state => state.isLoading);
export const useError = () => useGlobalStore(state => state.error);
export const useSidebarOpen = () => useGlobalStore(state => state.sidebarOpen);
