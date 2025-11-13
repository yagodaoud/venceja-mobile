import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Categoria, CreateCategoriaRequest, UpdateCategoriaRequest } from '@/types';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

export const useCategories = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categorias'],
    queryFn: () => apiClient.getCategorias(0, 100),
    staleTime: 60000, // 1 minute
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoriaRequest) => apiClient.createCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t('categoryCreated'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('error'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoriaRequest }) =>
      apiClient.updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t('categoryUpdated'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('error'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t('categoryDeleted'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('error'),
      });
    },
  });

  return {
    categories: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createCategory: (data: CreateCategoriaRequest, options?: { onSuccess?: () => void; onError?: () => void }) => {
      createMutation.mutate(data, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
        onError: () => {
          options?.onError?.();
        },
      });
    },
    updateCategory: (data: { id: number; data: UpdateCategoriaRequest }, options?: { onSuccess?: () => void; onError?: () => void }) => {
      updateMutation.mutate(data, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
        onError: () => {
          options?.onError?.();
        },
      });
    },
    deleteCategory: deleteMutation.mutate,
  };
};

