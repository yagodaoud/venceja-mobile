import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { Boleto } from '@/types';
import { useBoletos } from '@/hooks/useBoletos';
import { useCategories } from '@/hooks/useCategories';
import { SingleDatePicker } from './DatePicker';
import { formatCurrencyForInput, parseCurrencyFromBrazilian, formatDate, parseDate } from '@/lib/utils';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';
import CategoryPicker from './CategoryPicker';
import { useModalStore } from '@/store/modalStore';
import { modalStyles, commonStyles, colors } from '@/styles';

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
  const { setModalOpen } = useModalStore();

  const isEditMode = !!boleto;

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen, setModalOpen]);

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
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modal}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>
              {isEditMode ? 'Editar Boleto' : 'Criar Boleto'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={modalStyles.closeButton}>
              <X size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>
            <View style={commonStyles.field}>
              <Text style={commonStyles.label}>Fornecedor *</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Nome do fornecedor"
                value={fornecedor}
                onChangeText={setFornecedor}
                autoCapitalize="words"
                placeholderTextColor={colors.text.lighter}
              />
            </View>

            <View style={commonStyles.field}>
              <Text style={commonStyles.label}>Valor *</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="0,00"
                value={valor}
                onChangeText={handleValorChange}
                onBlur={handleValorBlur}
                keyboardType="numeric"
                placeholderTextColor={colors.text.lighter}
              />
            </View>

            <View style={commonStyles.field}>
              <Text style={commonStyles.label}>Vencimento *</Text>
              <SingleDatePicker
                date={vencimento}
                onDateChange={setVencimento}
                placeholder="DD/MM/AAAA"
              />
            </View>

            <View style={commonStyles.field}>
              <Text style={commonStyles.label}>Código de Barras (opcional)</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Código de barras"
                value={codigoBarras}
                onChangeText={setCodigoBarras}
                keyboardType="numeric"
                placeholderTextColor={colors.text.lighter}
              />
            </View>

            <View style={commonStyles.field}>
              <Text style={commonStyles.label}>Categoria (opcional)</Text>
              <CategoryPicker
                categories={categories}
                selectedId={categoriaId}
                onSelect={setCategoriaId}
                showLabel={false}
              />
            </View>
          </ScrollView>

          <View style={modalStyles.actions}>
            <TouchableOpacity
              style={[modalStyles.actionButton, modalStyles.actionButtonCancel]}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={modalStyles.actionButtonTextCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                modalStyles.actionButton,
                modalStyles.actionButtonPrimary,
                isSubmitting && modalStyles.actionButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || !fornecedor.trim() || !valor || !vencimento}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.text.white} />
              ) : (
                <Text style={modalStyles.actionButtonTextPrimary}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


