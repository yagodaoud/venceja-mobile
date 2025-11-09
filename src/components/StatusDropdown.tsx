import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ChevronDown, Check, Filter } from 'lucide-react-native';
import { BoletoStatus } from '@/types';

interface StatusDropdownProps {
  selectedStatus: BoletoStatus | 'ALL';
  onStatusChange: (status: BoletoStatus | 'ALL') => void;
}

const statusOptions: Array<{ label: string; value: BoletoStatus | 'ALL' }> = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendente', value: 'PENDENTE' },
  { label: 'Vencido', value: 'VENCIDO' },
  { label: 'Pago', value: 'PAGO' },
];

export default function StatusDropdown({ selectedStatus, onStatusChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Todos';

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsOpen(true)}
      >
        <Filter size={20} color="#4CAF50" />
        <Text style={styles.buttonText}>{selectedLabel}</Text>
        <ChevronDown size={20} color="#4CAF50" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar por Status</Text>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.option}
                onPress={() => {
                  onStatusChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  selectedStatus === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
                {selectedStatus === option.value && (
                  <Check size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '100%',
  },
  buttonText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
  },
  optionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

