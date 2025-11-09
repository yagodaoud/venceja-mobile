import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBoletos } from '@/hooks/useBoletos';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import ScanModal from '@/components/ScanModal';
import { Boleto } from '@/types';
import { commonStyles, colors, spacing, borderRadius } from '@/styles';

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
    <SafeAreaView style={commonStyles.screenContainer} edges={['top']}>
      <View style={{ padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={commonStyles.screenTitle}>{t('scanBoleto')}</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl }}>
        <Text style={{ fontSize: spacing.lg, color: colors.text.tertiary, textAlign: 'center', marginBottom: spacing.xxxxl }}>
          Escolha uma opção para escanear o boleto
        </Text>

        <View style={{ width: '100%', gap: spacing.lg }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: borderRadius.lg,
              padding: spacing.xxxxl,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: colors.primary,
              borderStyle: 'dashed',
            }}
            onPress={handleTakePhoto}
            disabled={isScanning}
          >
            <Camera size={48} color={colors.primary} />
            <Text style={{ marginTop: spacing.md, fontSize: spacing.lg, fontWeight: '600', color: colors.primary }}>
              {t('takePhoto')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: borderRadius.lg,
              padding: spacing.xxxxl,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: colors.primary,
              borderStyle: 'dashed',
            }}
            onPress={handleChooseFromGallery}
            disabled={isScanning}
          >
            <ImageIcon size={48} color={colors.primary} />
            <Text style={{ marginTop: spacing.md, fontSize: spacing.lg, fontWeight: '600', color: colors.primary }}>
              {t('chooseFromGallery')}
            </Text>
          </TouchableOpacity>
        </View>

        {isScanning && (
          <View style={{ marginTop: spacing.xxxxl, alignItems: 'center', gap: spacing.md }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ fontSize: spacing.md, color: colors.text.tertiary }}>{t('scanning')}</Text>
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

