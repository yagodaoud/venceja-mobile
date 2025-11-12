import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { LoginRequest } from '@/types';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

export const useAuth = () => {
  const { setAuth, clearAuth } = useAuthStore();
  const { t } = useTranslation();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onSuccess: (response) => {
      setAuth(
        response.data.user,
        response.data.accessToken,
        response.data.refreshToken
      );
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t('login'),
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: error.response?.data?.message || t('invalidCredentials'),
      });
    },
  });

  const logout = async () => {
    try {
      // Get refresh token before clearing auth
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        // Call logout endpoint to invalidate session on backend
        await apiClient.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local auth regardless of API call result
      await clearAuth();
      Toast.show({
        type: 'info',
        text1: t('logout'),
      });
    }
  };

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    logout,
  };
};

