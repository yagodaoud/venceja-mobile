import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { Boleto } from '@/types';
import { useBoletos } from '@/hooks/useBoletos';
import { useCategories } from '@/hooks/useCategories';
import { SingleDatePicker } from './DatePicker';
import { formatCurrencyForInput, parseCurrencyFromBrazilian, formatDate, parseDate } from '@/lib/utils';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';
import CategoryPicker from './CategoryPicker';

interface BoletoModalProps {
  boleto?: Boleto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (boleto: Boleto) => void;
}

export default function BoletoModal({ boleto, isOpen, onClose, onSuccess }: BoletoModalProps) {
  const [fornecedor, setFornecedor] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState<Date | undefined>(undefined);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createBoleto, updateBoleto } = useBoletos();
  const { categories } = useCategories();

  const isEditMode = !!boleto;

  // Reset form when modal opens/closes or boleto changes
  useEffect(() => {
    if (isOpen) {
      if (boleto) {
        setFornecedor(boleto.fornecedor);
        setValor(formatCurrencyForInput(boleto.valor));
        const parsedDate = parseDate(boleto.vencimento);
        setVencimento(isNaN(parsedDate.getTime()) ? undefined : parsedDate);
        setCodigoBarras(boleto.codigoBarras || '');
        setCategoriaId(boleto.categoria?.id || null);
      } else {
        setFornecedor('');
        setValor('');
        setVencimento(undefined);
        setCodigoBarras('');
        setCategoriaId(null);
      }
    }
  }, [isOpen, boleto]);

  const handleSubmit = async () => {
    if (!fornecedor.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O fornecedor é obrigatório',
      });
      return;
    }

    const valorNumber = parseCurrencyFromBrazilian(valor);
    if (isNaN(valorNumber) || valorNumber <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, insira um valor válido',
      });
      return;
    }

    if (!vencimento) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'A data de vencimento é obrigatória',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const vencimentoFormatted = format(vencimento, 'dd/MM/yyyy');

      const boletoData = {
        fornecedor: fornecedor.trim(),
        valor: valorNumber,
        vencimento: vencimentoFormatted,
        codigoBarras: codigoBarras.trim() || undefined,
        categoriaId: categoriaId || null,
      };

      if (isEditMode && boleto) {
        updateBoleto(
          { id: boleto.id, data: boletoData },
          {
            onSuccess: (result) => {
              setIsSubmitting(false);
              Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Boleto atualizado com sucesso',
              });
              if (onSuccess) {
                onSuccess(result);
              }
              handleClose();
            },
            onError: (error) => {
              setIsSubmitting(false);
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Erro ao atualizar boleto',
              });
            },
          }
        );
      } else {
        createBoleto(boletoData, {
          onSuccess: (result) => {
            setIsSubmitting(false);
            Toast.show({
              type: 'success',
              text1: 'Sucesso',
              text2: 'Boleto criado com sucesso',
            });
            if (onSuccess) {
              onSuccess(result);
            }
            handleClose();
          },
          onError: (error) => {
            setIsSubmitting(false);
            Toast.show({
              type: 'error',
              text1: 'Erro',
              text2: 'Erro ao criar boleto',
            });
          },
        });
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFornecedor('');
    setValor('');
    setVencimento(undefined);
    setCodigoBarras('');
    setCategoriaId(null);
    onClose();
  };

  const handleValorChange = (text: string) => {
    // Remove all non-digit characters except comma
    let input = text.replace(/[^\d,]/g, '');
    // Only allow one comma
    const parts = input.split(',');
    if (parts.length > 2) {
      input = parts[0] + ',' + parts.slice(1).join('');
    }
    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
      input = parts[0] + ',' + parts[1].substring(0, 2);
    }
    setValor(input);
  };

  const handleValorBlur = () => {
    // Format on blur with thousands separators if valid
    const parsed = parseCurrencyFromBrazilian(valor);
    if (!isNaN(parsed) && parsed >= 0) {
      setValor(formatCurrencyForInput(parsed));
    } else if (valor.trim() === '') {
      setValor('');
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditMode ? 'Editar Boleto' : 'Criar Boleto'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>Fornecedor *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do fornecedor"
                value={fornecedor}
                onChangeText={setFornecedor}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Valor *</Text>
              <TextInput
                style={styles.input}
                placeholder="0,00"
                value={valor}
                onChangeText={handleValorChange}
                onBlur={handleValorBlur}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Vencimento *</Text>
              <SingleDatePicker
                date={vencimento}
                onDateChange={setVencimento}
                placeholder="DD/MM/AAAA"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Código de Barras (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Código de barras"
                value={codigoBarras}
                onChangeText={setCodigoBarras}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Categoria (opcional)</Text>
              <CategoryPicker
                categories={categories}
                selectedId={categoriaId}
                onSelect={setCategoriaId}
                showLabel={false}
              />
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || !fornecedor.trim() || !valor || !vencimento}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
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
    maxHeight: '90%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  content: {
    maxHeight: 500,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#757575',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

