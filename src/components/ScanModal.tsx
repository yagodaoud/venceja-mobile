import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView, TextInput as RNTextInput, useWindowDimensions } from 'react-native';
import { Boleto } from '@/types';
import { useBoletos } from '@/hooks/useBoletos';
import { useCategories } from '@/hooks/useCategories';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react-native';
import { format, parse } from 'date-fns';
import { parseDate } from '@/lib/utils';
import { SingleDatePicker } from './DatePicker';
import CategoryPicker from './CategoryPicker';
import { useModalStore } from '@/store/modalStore';
import { colors, spacing, borderRadius, shadows, typography } from '@/styles';

const scanSchema = z.object({
  fornecedor: z.string().min(1, 'Fornecedor é obrigatório'),
  valor: z.string().refine((val) => {
    const num = parseFloat(val.replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, 'Valor deve ser maior que zero'),
  vencimento: z
    .union([z.date(), z.undefined()])
    .refine((date) => date !== undefined, {
      message: 'Data de vencimento é obrigatória',
    }),
  codigoBarras: z.string().optional(),
  categoriaId: z.number().nullable().optional(),
});

type ScanFormData = z.infer<typeof scanSchema>;

interface ScanModalProps {
  visible: boolean;
  scannedBoleto: Boleto | null;
  scannedImageUri: string | null;
  onClose: () => void;
}

export default function ScanModal({ visible, scannedBoleto, scannedImageUri, onClose }: ScanModalProps) {
  const { t } = useTranslation();
  const { createBoleto } = useBoletos();
  const { categories } = useCategories();
  const { setModalOpen } = useModalStore();
  const { height: screenHeight } = useWindowDimensions();

  // Calculate scroll view height: screen height * 0.95 (95%) - header height (~80) - buttons height (~100) - padding
  const scrollViewHeight = screenHeight * 0.95 - 180;

  useEffect(() => {
    setModalOpen(visible);
  }, [visible, setModalOpen]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ScanFormData>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      fornecedor: '',
      valor: '',
      vencimento: undefined,
      codigoBarras: '',
      categoriaId: null,
    },
  });

  useEffect(() => {
    if (scannedBoleto) {
      setValue('fornecedor', scannedBoleto.fornecedor || '');
      setValue('valor', scannedBoleto.valor?.toString().replace('.', ',') || '');

      // Parse date from DD/MM/YYYY format (or ISO if backend sends that)
      if (scannedBoleto.vencimento) {
        const parsedDate = parseDate(scannedBoleto.vencimento);
        setValue('vencimento', parsedDate);
      }

      setValue('codigoBarras', scannedBoleto.codigoBarras || '');
      setValue('categoriaId', scannedBoleto.categoria?.id || null);
    }
  }, [scannedBoleto, setValue]);

  const onSubmit = (data: ScanFormData) => {
    // Type assertion: zod refine ensures vencimento is Date if validation passes
    if (!data.vencimento) {
      return; // Should not happen due to validation, but TypeScript safety
    }
    const valor = parseFloat(data.valor.replace(',', '.'));
    createBoleto(
      {
        fornecedor: data.fornecedor,
        valor,
        vencimento: format(data.vencimento, 'dd/MM/yyyy'),
        codigoBarras: data.codigoBarras || undefined,
        categoriaId: data.categoriaId || null,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: colors.background.primary,
          borderTopLeftRadius: borderRadius.xxl,
          borderTopRightRadius: borderRadius.xxl,
          maxHeight: '95%',
          width: '100%',
          ...shadows.lg,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xl,
            paddingBottom: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}>
            <Text style={{
              fontSize: typography.sizes.xxl,
              fontWeight: typography.weights.bold,
              color: colors.text.primary,
            }}>
              {t('editScanData')}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.background.secondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{
              maxHeight: Math.max(400, scrollViewHeight),
            }}
            contentContainerStyle={{
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.lg,
              paddingBottom: spacing.md,
            }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <View style={{ gap: spacing.lg }}>
              {/* Image Preview */}
              {scannedImageUri && (
                <View style={{
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  backgroundColor: colors.background.secondary,
                  marginBottom: spacing.sm,
                }}>
                  <Image
                    source={{ uri: scannedImageUri }}
                    style={{
                      width: '100%',
                      height: 200,
                      resizeMode: 'cover',
                    }}
                  />
                </View>
              )}

              {/* Fornecedor Field */}
              <View>
                <Text style={{
                  fontSize: typography.sizes.md,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.sm,
                }}>
                  {t('supplier')}
                </Text>
                <Controller
                  control={control}
                  name="fornecedor"
                  render={({ field: { onChange, value } }) => (
                    <RNTextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Digite o nome do fornecedor"
                      placeholderTextColor={colors.text.lighter}
                      style={{
                        borderWidth: 1,
                        borderColor: errors.fornecedor ? colors.error : colors.borderLight,
                        borderRadius: borderRadius.md,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.md,
                        fontSize: typography.sizes.lg,
                        color: colors.text.secondary,
                        backgroundColor: colors.background.primary,
                      }}
                    />
                  )}
                />
                {errors.fornecedor && (
                  <Text style={{
                    color: colors.error,
                    fontSize: typography.sizes.sm,
                    marginTop: spacing.xs,
                    marginLeft: spacing.xs,
                  }}>
                    {errors.fornecedor.message}
                  </Text>
                )}
              </View>

              {/* Valor Field */}
              <View>
                <Text style={{
                  fontSize: typography.sizes.md,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.sm,
                }}>
                  {t('value')}
                </Text>
                <Controller
                  control={control}
                  name="valor"
                  render={({ field: { onChange, value } }) => (
                    <RNTextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="0,00"
                      placeholderTextColor={colors.text.lighter}
                      keyboardType="numeric"
                      style={{
                        borderWidth: 1,
                        borderColor: errors.valor ? colors.error : colors.borderLight,
                        borderRadius: borderRadius.md,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.md,
                        fontSize: typography.sizes.lg,
                        color: colors.text.secondary,
                        backgroundColor: colors.background.primary,
                      }}
                    />
                  )}
                />
                {errors.valor && (
                  <Text style={{
                    color: colors.error,
                    fontSize: typography.sizes.sm,
                    marginTop: spacing.xs,
                    marginLeft: spacing.xs,
                  }}>
                    {errors.valor.message}
                  </Text>
                )}
              </View>

              {/* Vencimento Field */}
              <View>
                <Text style={{
                  fontSize: typography.sizes.md,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.sm,
                }}>
                  {t('dueDate')}
                </Text>
                <Controller
                  control={control}
                  name="vencimento"
                  render={({ field: { onChange, value } }) => (
                    <SingleDatePicker
                      date={value}
                      onDateChange={onChange}
                      placeholder="Selecione a data de vencimento"
                    />
                  )}
                />
                {errors.vencimento && (
                  <Text style={{
                    color: colors.error,
                    fontSize: typography.sizes.sm,
                    marginTop: spacing.xs,
                    marginLeft: spacing.xs,
                  }}>
                    {errors.vencimento.message}
                  </Text>
                )}
              </View>

              {/* Código de Barras Field */}
              <View>
                <Text style={{
                  fontSize: typography.sizes.md,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.sm,
                }}>
                  {t('barcode')}
                </Text>
                <Controller
                  control={control}
                  name="codigoBarras"
                  render={({ field: { onChange, value } }) => (
                    <RNTextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Código de barras (opcional)"
                      placeholderTextColor={colors.text.lighter}
                      style={{
                        borderWidth: 1,
                        borderColor: colors.borderLight,
                        borderRadius: borderRadius.md,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.md,
                        fontSize: typography.sizes.lg,
                        color: colors.text.secondary,
                        backgroundColor: colors.background.primary,
                      }}
                    />
                  )}
                />
              </View>

              {/* Category Picker */}
              <Controller
                control={control}
                name="categoriaId"
                render={({ field: { onChange, value } }) => (
                  <CategoryPicker
                    categories={categories}
                    selectedId={value || null}
                    onSelect={(id) => onChange(id)}
                  />
                )}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: spacing.md,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
          }}>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                flex: 1,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background.primary,
                borderWidth: 1,
                borderColor: colors.text.tertiary,
              }}
            >
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.text.tertiary,
              }}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              style={{
                flex: 1,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primary,
                ...shadows.sm,
              }}
            >
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.text.white,
              }}>
                {t('save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
