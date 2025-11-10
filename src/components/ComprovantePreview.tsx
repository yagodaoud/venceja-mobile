import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { X, ZoomIn, ZoomOut, Download, Share2 } from 'lucide-react-native';
import { modalStyles, colors, spacing } from '@/styles';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

interface ComprovantePreviewProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export default function ComprovantePreview({ visible, imageUri, onClose }: ComprovantePreviewProps) {
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleDownload = async () => {
    if (!imageUri) return;

    try {
      setIsDownloading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Get file extension from URI
      const fileExtension = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `comprovante_${Date.now()}.${fileExtension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Download the image
      const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);

      if (downloadResult.status === 200) {
        // Save to media library (requires expo-media-library)
        // For now, we'll just save to the app's document directory
        // On Android, users can access it via file manager
        // On iOS, we'll use the share functionality to save to Photos
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: 'success',
          text1: 'Download concluído!',
          text2: 'Comprovante salvo com sucesso',
        });

        // Try to share so user can save to Photos (iOS) or access file (Android)
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri);
        }
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao baixar',
        text2: 'Não foi possível baixar o comprovante',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!imageUri) return;

    try {
      setIsSharing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // First, download the image to a local file
      const fileExtension = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `comprovante_${Date.now()}.${fileExtension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);

      if (downloadResult.status === 200 && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: `image/${fileExtension}`,
          dialogTitle: 'Compartilhar comprovante',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Fallback to React Native Share
        const { Share } = await import('react-native');
        await Share.share({
          message: imageUri,
          url: imageUri,
        });
      }
    } catch (error: any) {
      console.error('Share error:', error);
      // Fallback to React Native Share
      try {
        const { Share } = await import('react-native');
        await Share.share({
          message: imageUri,
          url: imageUri,
        });
      } catch (fallbackError) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: 'error',
          text1: 'Erro ao compartilhar',
          text2: 'Não foi possível compartilhar o comprovante',
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlayDark}>
        <View style={modalStyles.imagePreviewHeader}>
          <Text style={modalStyles.imagePreviewTitle}>Comprovante</Text>
          <View style={modalStyles.imagePreviewActions}>
            <TouchableOpacity
              style={modalStyles.imagePreviewButton}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              <Download size={24} color={colors.text.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.imagePreviewButton}
              onPress={handleShare}
              disabled={isSharing}
            >
              <Share2 size={24} color={colors.text.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.imagePreviewButton}
              onPress={() => setScale(Math.min(scale + 0.5, 3))}
            >
              <ZoomIn size={24} color={colors.text.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.imagePreviewButton}
              onPress={() => setScale(Math.max(scale - 0.5, 0.5))}
            >
              <ZoomOut size={24} color={colors.text.white} />
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.imagePreviewButton} onPress={onClose}>
              <X size={24} color={colors.text.white} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          style={modalStyles.imagePreviewScrollView}
          contentContainerStyle={modalStyles.imagePreviewScrollContent}
          maximumZoomScale={3}
          minimumZoomScale={0.5}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Image
            source={{ uri: imageUri }}
            style={[modalStyles.imagePreviewImage, { transform: [{ scale }] }]}
            resizeMode="contain"
          />
        </ScrollView>
      </View>
    </Modal>
  );
}


