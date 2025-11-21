import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { ChevronDown, Check, Filter } from 'lucide-react-native';
import { BoletoStatus } from '@/types';
import { modalStyles, commonStyles, colors, spacing } from '@/styles';

interface StatusDropdownProps {
  selectedStatus: BoletoStatus | 'ALL' | string;
  onStatusChange: (status: BoletoStatus | 'ALL' | string) => void;
}

const statusOptions: Array<{ label: string; value: BoletoStatus | 'ALL' | string }> = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendente e Vencido', value: 'PENDENTE,VENCIDO' },
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
        style={[commonStyles.input, { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }]}
        onPress={() => setIsOpen(true)}
      >
        <Filter size={20} color={colors.primary} />
        <Text style={{ fontSize: spacing.md, color: colors.text.secondary, fontWeight: '500', flex: 1 }}>
          {selectedLabel}
        </Text>
        <ChevronDown size={20} color={colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={modalStyles.overlayCenter}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={modalStyles.modalCenter} onStartShouldSetResponder={() => true}>
            <Text style={[modalStyles.title, { marginBottom: spacing.lg }]}>Filtrar por Status</Text>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={modalStyles.modalOption}
                onPress={() => {
                  onStatusChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Text style={[
                  modalStyles.modalOptionText,
                  selectedStatus === option.value && modalStyles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {selectedStatus === option.value && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}


