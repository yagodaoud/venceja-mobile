import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Boleto, BoletoFilters, CreateBoletoRequest, UpdateBoletoRequest } from '@/types';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

export const useBoletos = (filters?: BoletoFilters) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['boletos', filters],
    queryFn: () => apiClient.getBoletos(filters),
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBoletoRequest) => apiClient.createBoleto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t('boletos'),
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
    mutationFn: ({ id, data }: { id: number; data: UpdateBoletoRequest }) =>
      apiClient.updateBoleto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t('update'),
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
    mutationFn: (id: number) => apiClient.deleteBoleto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t('delete'),
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

  const scanMutation = useMutation({
    mutationFn: (imageUri: string) => apiClient.scanBoleto(imageUri),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t('scanSuccess'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('scanError'),
      });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ id, comprovanteUri }: { id: number; comprovanteUri?: string }) =>
      apiClient.markBoletoAsPaid(id, comprovanteUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t('paymentSuccess'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('paymentError'),
      });
    },
  });

  return {
    boletos: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createBoleto: (data: CreateBoletoRequest, options?: { onSuccess?: (data: Boleto) => void; onError?: (error: any) => void }) => {
      createMutation.mutate(data, {
        onSuccess: (result) => {
          options?.onSuccess?.(result);
        },
        onError: (error) => {
          options?.onError?.(error);
        },
      });
    },
    updateBoleto: (data: { id: number; data: UpdateBoletoRequest }, options?: { onSuccess?: (data: Boleto) => void; onError?: (error: any) => void }) => {
      updateMutation.mutate(data, {
        onSuccess: (result) => {
          options?.onSuccess?.(result);
        },
        onError: (error) => {
          options?.onError?.(error);
        },
      });
    },
    deleteBoleto: deleteMutation.mutate,
    scanBoleto: (imageUri: string, options?: { onSuccess?: (data: Boleto) => void; onError?: (error: any) => void }) => {
      scanMutation.mutate(imageUri, {
        onSuccess: (result) => {
          options?.onSuccess?.(result);
        },
        onError: (error) => {
          options?.onError?.(error);
        },
      });
    },
    markPaid: (data: { id: number; comprovanteUri?: string }, options?: { onSuccess?: (data: Boleto) => void; onError?: (error: any) => void }) => {
      markPaidMutation.mutate(data, {
        onSuccess: (result) => {
          options?.onSuccess?.(result);
        },
        onError: (error) => {
          options?.onError?.(error);
        },
      });
    },
    isScanning: scanMutation.isPending,
    isMarkingPaid: markPaidMutation.isPending,
  };
};

