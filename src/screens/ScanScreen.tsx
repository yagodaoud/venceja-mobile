import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBoletos } from '@/hooks/useBoletos';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import ScanModal from '@/components/ScanModal';
import { Boleto } from '@/types';

export default function ScanScreen() {
  const { t } = useTranslation();
  const { scanBoleto, isScanning } = useBoletos();
  const [scannedBoleto, setScannedBoleto] = useState<Boleto | null>(null);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      handleScan(result.assets[0].uri);
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
      handleScan(result.assets[0].uri);
    }
  };

  const handleScan = (imageUri: string) => {
    setScannedImageUri(imageUri);
    scanBoleto(imageUri, {
      onSuccess: (data) => {
        setScannedBoleto(data);
        setModalVisible(true);
      },
      onError: () => {
        // Error toast is handled in the hook
        // Still show modal with empty data for manual entry
        setScannedBoleto(null);
        setModalVisible(true);
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('scanBoleto')}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Escolha uma opção para escanear o boleto
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleTakePhoto}
            disabled={isScanning}
          >
            <Camera size={48} color="#4CAF50" />
            <Text style={styles.buttonText}>{t('takePhoto')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleChooseFromGallery}
            disabled={isScanning}
          >
            <ImageIcon size={48} color="#4CAF50" />
            <Text style={styles.buttonText}>{t('chooseFromGallery')}</Text>
          </TouchableOpacity>
        </View>

        {isScanning && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>{t('scanning')}</Text>
          </View>
        )}
      </View>

      <ScanModal
        visible={modalVisible}
        scannedBoleto={scannedBoleto}
        scannedImageUri={scannedImageUri}
        onClose={() => {
          setModalVisible(false);
          setScannedBoleto(null);
          setScannedImageUri(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  scanButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  buttonText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  loading: {
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#757575',
  },
});

