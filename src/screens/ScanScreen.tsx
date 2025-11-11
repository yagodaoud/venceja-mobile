import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useBoletos } from '@/hooks/useBoletos';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react-native';
import ScanModal from '@/components/ScanModal';
import ScreenHeader from '@/components/ScreenHeader';
import { Boleto } from '@/types';
import { commonStyles, colors, spacing, borderRadius, shadows, typography } from '@/styles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ScanScreen() {
  const { t } = useTranslation();
  const { scanBoleto, isScanning } = useBoletos();
  const [scannedBoleto, setScannedBoleto] = useState<Boleto | null>(null);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Animation values
  const fadeIn = useSharedValue(0);
  const cameraScale = useSharedValue(0.9);
  const galleryScale = useSharedValue(0.9);

  useEffect(() => {
    // Entrance animations
    fadeIn.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    cameraScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    galleryScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  }, []);

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

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const cameraButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cameraScale.value }],
  }));

  const galleryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: galleryScale.value }],
  }));

  return (
    <SafeAreaView style={[commonStyles.screenContainer, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <ScreenHeader
        title={t('scanBoleto')}
        subtitle="Escaneie seu boleto rapidamente"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={containerAnimatedStyle}>
          {/* Instructions Card */}
          <View
            style={{
              backgroundColor: colors.background.primary,
              borderRadius: borderRadius.lg,
              padding: spacing.xl,
              marginBottom: spacing.md,
              ...shadows.md,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Sparkles size={20} color={colors.primary} />
              <Text
                style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: '600',
                  color: colors.text.secondary,
                  marginLeft: spacing.sm,
                }}
              >
                Dicas para melhor resultado
              </Text>
            </View>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <CheckCircle2 size={16} color={colors.primary} style={{ marginTop: 3, marginRight: spacing.sm }} />
                <Text style={{ fontSize: typography.sizes.md, color: colors.text.tertiary, flex: 1, lineHeight: 22 }}>
                  Certifique-se de que o boleto está bem iluminado
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <CheckCircle2 size={16} color={colors.primary} style={{ marginTop: 3, marginRight: spacing.sm }} />
                <Text style={{ fontSize: typography.sizes.md, color: colors.text.tertiary, flex: 1, lineHeight: 22 }}>
                  Mantenha a câmera estável e em foco
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <CheckCircle2 size={16} color={colors.primary} style={{ marginTop: 3, marginRight: spacing.sm }} />
                <Text style={{ fontSize: typography.sizes.md, color: colors.text.tertiary, flex: 1, lineHeight: 22 }}>
                  Enquadre todo o código de barras ou linha digitável
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: spacing.md }}>
            <AnimatedTouchableOpacity
              style={[
                {
                  backgroundColor: colors.background.primary,
                  borderRadius: borderRadius.lg,
                  padding: spacing.xl,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: colors.primary,
                  ...shadows.md,
                  minHeight: 160,
                },
                cameraButtonStyle,
              ]}
              onPress={handleTakePhoto}
              disabled={isScanning}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primaryLightest, colors.background.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: borderRadius.lg - 2,
                  opacity: 0.3,
                }}
              />
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                  ...shadows.sm,
                }}
              >
                <Camera size={32} color={colors.text.white} strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: typography.sizes.xl,
                  fontWeight: '700',
                  color: colors.primary,
                  marginBottom: spacing.xs,
                }}
              >
                {t('takePhoto')}
              </Text>
              <Text
                style={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.tertiary,
                  textAlign: 'center',
                }}
              >
                Tire uma foto do boleto
              </Text>
            </AnimatedTouchableOpacity>

            <AnimatedTouchableOpacity
              style={[
                {
                  backgroundColor: colors.background.primary,
                  borderRadius: borderRadius.lg,
                  padding: spacing.xl,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: colors.secondary,
                  ...shadows.md,
                  minHeight: 160,
                },
                galleryButtonStyle,
              ]}
              onPress={handleChooseFromGallery}
              disabled={isScanning}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.secondaryLight, colors.background.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: borderRadius.lg - 2,
                  opacity: 0.2,
                }}
              />
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.secondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                  ...shadows.sm,
                }}
              >
                <ImageIcon size={32} color={colors.text.white} strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: typography.sizes.xl,
                  fontWeight: '700',
                  color: colors.secondary,
                  marginBottom: spacing.xs,
                }}
              >
                {t('chooseFromGallery')}
              </Text>
              <Text
                style={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.tertiary,
                  textAlign: 'center',
                }}
              >
                Selecione uma imagem salva
              </Text>
            </AnimatedTouchableOpacity>
          </View>

          {/* Loading State */}
          {isScanning && (
            <View
              style={{
                marginTop: spacing.md,
                alignItems: 'center',
                gap: spacing.sm,
                padding: spacing.md,
                backgroundColor: colors.primaryLightest,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                borderColor: colors.primary,
                borderStyle: 'dashed',
              }}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                style={{
                  fontSize: typography.sizes.md,
                  fontWeight: '600',
                  color: colors.primary,
                }}
              >
                {t('scanning')}...
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

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

