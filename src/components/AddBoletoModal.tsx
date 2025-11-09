import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { X, Camera, FileText } from 'lucide-react-native';
import { useModalStore } from '@/store/modalStore';
import { modalStyles, colors, spacing } from '@/styles';

interface AddBoletoModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: () => void;
  onCreateManual: () => void;
}

export default function AddBoletoModal({ visible, onClose, onScan, onCreateManual }: AddBoletoModalProps) {
  const { setModalOpen } = useModalStore();

  useEffect(() => {
    setModalOpen(visible);
  }, [visible, setModalOpen]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.modal, { paddingBottom: spacing.xxxxl }]}>
          <View style={modalStyles.headerNoBorder}>
            <Text style={modalStyles.title}>Adicionar Boleto</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <X size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <Text style={modalStyles.description}>
            Escolha como deseja adicionar o boleto
          </Text>

          <View style={modalStyles.options}>
            <TouchableOpacity
              style={modalStyles.option}
              onPress={() => {
                onScan();
                onClose();
              }}
            >
              <View style={modalStyles.optionIconContainer}>
                <Camera size={32} color={colors.primary} />
              </View>
              <Text style={modalStyles.optionTitle}>Escanear Boleto</Text>
              <Text style={modalStyles.optionDescription}>
                Tire uma foto do boleto para preenchimento automático
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.option}
              onPress={() => {
                onCreateManual();
                onClose();
              }}
            >
              <View style={modalStyles.optionIconContainer}>
                <FileText size={32} color={colors.secondary} />
              </View>
              <Text style={modalStyles.optionTitle}>Criar Manualmente</Text>
              <Text style={modalStyles.optionDescription}>
                Preencha os dados do boleto manualmente
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={modalStyles.actionButtonCancel}
            onPress={onClose}
          >
            <Text style={modalStyles.actionButtonTextCancel}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


