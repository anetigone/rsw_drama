import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth';

export interface User {
  id: string;
  username: string;
  name: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  // 初始化时从 localStorage 恢复用户信息
  const initAuth = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('user');
      }
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      if (response.data) {
        token.value = response.data.token;
        user.value = response.data.user;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '登录失败');
    }
  };

  const logout = () => {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const verify = async () => {
    try {
      const response = await authApi.verify();
      if (response.data) {
        user.value = response.data.user;
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  // 初始化
  initAuth();

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    verify,
  };
});
