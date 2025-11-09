import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Categoria, CreateCategoriaRequest, UpdateCategoriaRequest } from '@/types';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

// Dummy data for offline testing
const dummyCategorias: Categoria[] = [
  {
    id: 1,
    userId: 1,
    nome: 'Alimentos',
    cor: '#4CAF50',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 1,
    nome: 'Bebidas',
    cor: '#2196F3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    userId: 1,
    nome: 'Limpeza',
    cor: '#FF9800',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useCategories = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categorias'],
    queryFn: () => apiClient.getCategorias(0, 100),
    staleTime: 60000, // 1 minute
    retry: false,
    placeholderData: {
      data: dummyCategorias,
      meta: {
        page: 0,
        size: 100,
        total: dummyCategorias.length,
        totalPages: 1,
      },
    },
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
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
  };
};

