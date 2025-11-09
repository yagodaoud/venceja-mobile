import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { LoginRequest } from '@/types';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

export const useAuth = () => {
  const { setAuth, clearAuth } = useAuthStore();
  const { t } = useTranslation();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.token);
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
    await clearAuth();
    Toast.show({
      type: 'info',
      text1: t('logout'),
    });
  };

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    logout,
  };
};

