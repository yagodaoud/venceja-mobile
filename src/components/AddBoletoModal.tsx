import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X, Camera, FileText } from 'lucide-react-native';

interface AddBoletoModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: () => void;
  onCreateManual: () => void;
}

export default function AddBoletoModal({ visible, onClose, onScan, onCreateManual }: AddBoletoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Adicionar Boleto</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Escolha como deseja adicionar o boleto
          </Text>

          <View style={styles.options}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                onScan();
                onClose();
              }}
            >
              <View style={styles.optionIconContainer}>
                <Camera size={32} color="#4CAF50" />
              </View>
              <Text style={styles.optionTitle}>Escanear Boleto</Text>
              <Text style={styles.optionDescription}>
                Tire uma foto do boleto para preenchimento automático
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                onCreateManual();
                onClose();
              }}
            >
              <View style={styles.optionIconContainer}>
                <FileText size={32} color="#2196F3" />
              </View>
              <Text style={styles.optionTitle}>Criar Manualmente</Text>
              <Text style={styles.optionDescription}>
                Preencha os dados do boleto manualmente
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
    textAlign: 'center',
  },
  options: {
    gap: 16,
    marginBottom: 24,
  },
  option: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#757575',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
});

