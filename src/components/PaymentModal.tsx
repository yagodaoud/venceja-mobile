import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ImageStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boleto } from '@/types';
import { useBoletos } from '@/hooks/useBoletos';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { Button } from 'react-native-paper';
import { useModalStore } from '@/store/modalStore';
import { modalStyles, colors, spacing } from '@/styles';
import { formatCurrency } from '@/lib/utils';

interface PaymentModalProps {
  visible: boolean;
  boleto: Boleto | null;
  onClose: () => void;
  initialComprovanteUri?: string | null;
}

export default function PaymentModal({ visible, boleto, onClose, initialComprovanteUri }: PaymentModalProps) {
  const { t } = useTranslation();
  const { markPaid, isMarkingPaid } = useBoletos();
  const { setModalOpen } = useModalStore();
  const [comprovanteUri, setComprovanteUri] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setModalOpen(visible);
    if (visible && initialComprovanteUri) {
      setComprovanteUri(initialComprovanteUri);
    } else if (visible && !initialComprovanteUri) {
      setComprovanteUri(null);
    }
  }, [visible, setModalOpen, initialComprovanteUri]);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setComprovanteUri(result.assets[0].uri);
    }
  };

  const handleChooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setComprovanteUri(result.assets[0].uri);
    }
  };

  const handleMarkPaid = () => {
    if (!boleto) return;

    markPaid(
      { id: boleto.id, comprovanteUri: comprovanteUri || undefined },
      {
        onSuccess: () => {
          setComprovanteUri(null);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setComprovanteUri(null);
    onClose();
  };

  if (!boleto) return null;

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
        <View style={[modalStyles.modalFullScreen, { paddingBottom: spacing.xl + insets.bottom }]}>
          <View style={modalStyles.headerNoBorder}>
            <Text style={modalStyles.title}>{t('markAsPaid')}</Text>
            <TouchableOpacity onPress={handleClose} style={modalStyles.closeButton}>
              <X size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.contentScroll}>
            <Text style={{ fontSize: spacing.lg, color: colors.text.tertiary, marginBottom: spacing.sm }}>
              {boleto.fornecedor} - {t('value')}: {formatCurrency(boleto.valor)}
            </Text>

            <Text style={{ fontSize: spacing.lg, fontWeight: '600', color: colors.text.primary, marginTop: spacing.sm }}>
              {t('addReceipt')} ({t('optional')})
            </Text>

            {comprovanteUri ? (
              <View style={modalStyles.imageContainer}>
                <Image
                  source={{ uri: comprovanteUri }}
                  style={modalStyles.image as ImageStyle}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={modalStyles.removeImageButton}
                  onPress={() => setComprovanteUri(null)}
                >
                  <X size={20} color={colors.text.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={modalStyles.buttonRow}>
                <TouchableOpacity style={modalStyles.imageButton} onPress={handleTakePhoto}>
                  <Camera size={24} color={colors.primary} />
                  <Text style={modalStyles.imageButtonText}>{t('takePhoto')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modalStyles.imageButton} onPress={handleChooseFromGallery}>
                  <ImageIcon size={24} color={colors.primary} />
                  <Text style={modalStyles.imageButtonText}>{t('chooseFromGallery')}</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={[modalStyles.actions, { marginTop: spacing.xl, paddingTop: 0, borderTopWidth: 0 }]}>
              <Button
                mode="outlined"
                onPress={handleClose}
                style={{ flex: 1, borderColor: colors.text.tertiary }}
                textColor={colors.text.secondary}
                disabled={isMarkingPaid}
              >
                {t('cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleMarkPaid}
                style={{ flex: 1, backgroundColor: colors.primary }}
                textColor={colors.text.white}
                loading={isMarkingPaid}
                disabled={isMarkingPaid}
              >
                {t('confirm')}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}


