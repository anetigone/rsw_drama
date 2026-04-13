import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth';

export interface User {
  id: string;
  name: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  const login = async (password: string) => {
    try {
      const response = await authApi.login(password);
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '登录失败');
    }
  };

  const logout = () => {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  };

  const verify = async () => {
    try {
      const response = await authApi.verify();
      user.value = response.data.user;
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    verify,
  };
});
