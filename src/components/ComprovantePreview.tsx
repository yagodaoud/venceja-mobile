import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { X, ZoomIn, ZoomOut } from 'lucide-react-native';
import { modalStyles, colors, spacing } from '@/styles';

interface ComprovantePreviewProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export default function ComprovantePreview({ visible, imageUri, onClose }: ComprovantePreviewProps) {
  const [scale, setScale] = useState(1);

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


