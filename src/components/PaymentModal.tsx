import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Boleto } from '@/types';
import { useBoletos } from '@/hooks/useBoletos';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { Button } from 'react-native-paper';

interface PaymentModalProps {
  visible: boolean;
  boleto: Boleto | null;
  onClose: () => void;
}

export default function PaymentModal({ visible, boleto, onClose }: PaymentModalProps) {
  const { t } = useTranslation();
  const { markPaid, isMarkingPaid } = useBoletos();
  const [comprovanteUri, setComprovanteUri] = useState<string | null>(null);

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
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('markAsPaid')}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.boletoInfo}>
              {boleto.fornecedor} - {t('value')}: R$ {boleto.valor.toFixed(2)}
            </Text>

            <Text style={styles.label}>{t('addReceipt')} ({t('optional')})</Text>

            {comprovanteUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: comprovanteUri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => setComprovanteUri(null)}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                  <Camera size={24} color="#4CAF50" />
                  <Text style={styles.imageButtonText}>{t('takePhoto')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageButton} onPress={handleChooseFromGallery}>
                  <ImageIcon size={24} color="#4CAF50" />
                  <Text style={styles.imageButtonText}>{t('chooseFromGallery')}</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleClose}
                style={styles.cancelButton}
                disabled={isMarkingPaid}
              >
                {t('cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleMarkPaid}
                style={styles.confirmButton}
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
    maxHeight: '80%',
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
    gap: 16,
  },
  boletoInfo: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  imageButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#757575',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
});

