import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { X, Camera, Image as ImageIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useModalStore } from '@/store/modalStore';
import { modalStyles, colors, spacing } from '@/styles';

interface ScanSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onUploadImage: () => void;
}

export default function ScanSourceModal({ visible, onClose, onTakePhoto, onUploadImage }: ScanSourceModalProps) {
  const { setModalOpen } = useModalStore();
  const insets = useSafeAreaInsets();

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
        <View style={[modalStyles.modal, { paddingBottom: spacing.xl + insets.bottom }]}>
          <View style={modalStyles.headerNoBorder}>
            <Text style={modalStyles.title}>Escanear Boleto</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <X size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <Text style={modalStyles.description}>
            Escolha como deseja escanear o boleto
          </Text>

          <View style={modalStyles.options}>
            <TouchableOpacity
              style={modalStyles.option}
              onPress={() => {
                onTakePhoto();
                onClose();
              }}
            >
              <View style={modalStyles.optionIconContainer}>
                <Camera size={32} color={colors.primary} />
              </View>
              <Text style={modalStyles.optionTitle}>Tirar Foto</Text>
              <Text style={modalStyles.optionDescription}>
                Tire uma foto do boleto com a câmera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.option}
              onPress={() => {
                onUploadImage();
                onClose();
              }}
            >
              <View style={modalStyles.optionIconContainer}>
                <ImageIcon size={32} color={colors.secondary} />
              </View>
              <Text style={modalStyles.optionTitle}>Enviar Imagem</Text>
              <Text style={modalStyles.optionDescription}>
                Selecione uma imagem da galeria
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

