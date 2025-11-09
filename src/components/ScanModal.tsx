import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('editScanData')}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {scannedImageUri && (
              <Image source={{ uri: scannedImageUri }} style={styles.image} />
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
                  style={styles.input}
                />
              )}
            />
            {errors.fornecedor && (
              <Text style={styles.error}>{errors.fornecedor.message}</Text>
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
                  style={styles.input}
                />
              )}
            />
            {errors.valor && (
              <Text style={styles.error}>{errors.valor.message}</Text>
            )}

            <Controller
              control={control}
              name="vencimento"
              render={({ field: { value } }) => (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
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
              <Text style={styles.error}>{errors.vencimento.message}</Text>
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
                  style={styles.input}
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

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleClose}
                style={styles.cancelButton}
              >
                {t('cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.saveButton}
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  content: {
    gap: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  input: {
    marginBottom: 8,
  },
  error: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#757575',
    borderRadius: 4,
    padding: 16,
    marginBottom: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#212121',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#757575',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
});

