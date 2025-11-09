import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Boleto } from '@/types';
import { useBoletos } from '@/hooks/useBoletos';
import { useCategories } from '@/hooks/useCategories';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, TextInput } from 'react-native-paper';
import { X } from 'lucide-react-native';
import { format, parse } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import CategoryPicker from './CategoryPicker';
import { useModalStore } from '@/store/modalStore';
import { modalStyles, commonStyles, colors, spacing } from '@/styles';

const scanSchema = z.object({
  fornecedor: z.string().min(1, 'Fornecedor é obrigatório'),
  valor: z.string().refine((val) => {
    const num = parseFloat(val.replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, 'Valor deve ser maior que zero'),
  vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setModalOpen(visible);
  }, [visible, setModalOpen]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScanFormData>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      fornecedor: '',
      valor: '',
      vencimento: '',
      codigoBarras: '',
      categoriaId: null,
    },
  });

  useEffect(() => {
    if (scannedBoleto) {
      setValue('fornecedor', scannedBoleto.fornecedor);
      setValue('valor', scannedBoleto.valor.toString().replace('.', ','));
      setValue('vencimento', format(new Date(scannedBoleto.vencimento), 'dd/MM/yyyy'));
      setValue('codigoBarras', scannedBoleto.codigoBarras || '');
      setValue('categoriaId', scannedBoleto.categoria?.id || null);
      setSelectedDate(new Date(scannedBoleto.vencimento));
    }
  }, [scannedBoleto, setValue]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setValue('vencimento', format(date, 'dd/MM/yyyy'));
    }
  };

  const onSubmit = (data: ScanFormData) => {
    const valor = parseFloat(data.valor.replace(',', '.'));
    createBoleto(
      {
        fornecedor: data.fornecedor,
        valor,
        vencimento: data.vencimento,
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
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modal}>
          <View style={modalStyles.headerNoBorder}>
            <Text style={modalStyles.title}>{t('editScanData')}</Text>
            <TouchableOpacity onPress={handleClose} style={modalStyles.closeButton}>
              <X size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.contentScroll} showsVerticalScrollIndicator={false}>
            {scannedImageUri && (
              <Image source={{ uri: scannedImageUri }} style={[modalStyles.image, { marginBottom: spacing.lg }]} />
            )}

            <Controller
              control={control}
              name="fornecedor"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('supplier')}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.fornecedor}
                  mode="outlined"
                  style={commonStyles.input}
                />
              )}
            />
            {errors.fornecedor && (
              <Text style={commonStyles.errorText}>{errors.fornecedor.message}</Text>
            )}

            <Controller
              control={control}
              name="valor"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('value')}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.valor}
                  mode="outlined"
                  keyboardType="numeric"
                  style={commonStyles.input}
                />
              )}
            />
            {errors.valor && (
              <Text style={commonStyles.errorText}>{errors.valor.message}</Text>
            )}

            <Controller
              control={control}
              name="vencimento"
              render={({ field: { value } }) => (
                <>
                  <TouchableOpacity
                    style={[commonStyles.input, { justifyContent: 'center', minHeight: 48 }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{ fontSize: spacing.lg, color: value ? colors.text.secondary : colors.text.lighter }}>
                      {t('dueDate')}: {value || t('date')}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </>
              )}
            />
            {errors.vencimento && (
              <Text style={commonStyles.errorText}>{errors.vencimento.message}</Text>
            )}

            <Controller
              control={control}
              name="codigoBarras"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('barcode')}
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={commonStyles.input}
                />
              )}
            />

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

            <View style={[modalStyles.actions, { marginTop: spacing.xl, marginBottom: spacing.xl, paddingTop: 0, borderTopWidth: 0 }]}>
              <Button
                mode="outlined"
                onPress={handleClose}
                style={{ flex: 1, borderColor: colors.text.tertiary }}
              >
                {t('cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={{ flex: 1, backgroundColor: colors.primary }}
              >
                {t('save')}
              </Button>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}


