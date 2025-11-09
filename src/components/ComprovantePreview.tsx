import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { X, ZoomIn, ZoomOut } from 'lucide-react-native';

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
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Comprovante</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => setScale(Math.min(scale + 0.5, 3))}
            >
              <ZoomIn size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => setScale(Math.max(scale - 0.5, 0.5))}
            >
              <ZoomOut size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={3}
          minimumZoomScale={0.5}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { transform: [{ scale }] }]}
            resizeMode="contain"
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  zoomButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    minHeight: 400,
  },
});

