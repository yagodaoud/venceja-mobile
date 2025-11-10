import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Search, X, Calendar } from 'lucide-react-native';
import { BoletoStatus } from '@/types';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AnimatedFilterChipsProps {
  selectedStatus?: BoletoStatus | 'ALL';
  selectedDateRange?: { start?: Date; end?: Date } | null;
  searchQuery?: string;
  onFilterChange: (filters: {
    status?: BoletoStatus | 'ALL';
    dateRange?: { start?: Date; end?: Date } | null;
    search?: string;
  }) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Separate component for animated chip to properly use hooks
interface FilterChipProps {
  filter: {
    id: string;
    label: string;
    value: BoletoStatus | 'ALL' | 'DATE';
    color?: string;
    icon?: React.ReactNode;
  };
  index: number;
  isSelected: boolean;
  selectedStatus: BoletoStatus | 'ALL';
  onPress: (value: BoletoStatus | 'ALL' | 'DATE') => void;
  formatDateRange?: () => string;
}

function FilterChip({
  filter,
  index,
  isSelected,
  onPress,
  formatDateRange,
}: FilterChipProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Stagger fade-in
    opacity.value = withTiming(1, {
      duration: 300,
      delay: index * 150,
      easing: Easing.out(Easing.ease),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  return (
    <AnimatedTouchable
      style={[
        styles.chip,
        isSelected && styles.chipSelected,
        filter.color && isSelected && { backgroundColor: filter.color },
        animatedStyle,
      ]}
      onPress={() => onPress(filter.value)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      {filter.icon && <View style={styles.chipIcon}>{filter.icon}</View>}
      <Text
        style={[
          styles.chipText,
          isSelected && styles.chipTextSelected,
          filter.color && isSelected && { color: '#FFFFFF' },
        ]}
      >
        {filter.value === 'DATE' && formatDateRange
          ? formatDateRange()
          : filter.label}
      </Text>
    </AnimatedTouchable>
  );
}

export default function AnimatedFilterChips({
  selectedStatus = 'ALL',
  selectedDateRange = null,
  searchQuery = '',
  onFilterChange,
}: AnimatedFilterChipsProps) {
  const [searchText, setSearchText] = useState(searchQuery);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [tempDateRange, setTempDateRange] = useState<{ start?: Date; end?: Date } | null>(
    selectedDateRange
  );

  const filters: Array<{
    id: string;
    label: string;
    value: BoletoStatus | 'ALL' | 'DATE';
    color?: string;
    icon?: React.ReactNode;
  }> = [
    { id: 'all', label: 'Todos', value: 'ALL' },
    {
      id: 'pending',
      label: 'Pendente',
      value: 'PENDENTE',
      color: '#FF9800',
    },
    {
      id: 'expired',
      label: 'Vencido',
      value: 'VENCIDO',
      color: '#F44336',
    },
    {
      id: 'paid',
      label: 'Pago',
      value: 'PAGO',
      color: '#A7B758',
    },
    {
      id: 'date',
      label: 'Este Mês',
      value: 'DATE',
      icon: <Calendar size={16} color="#6B7280" />,
    },
  ];

  const handleFilterPress = (value: BoletoStatus | 'ALL' | 'DATE') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (value === 'DATE') {
      setShowDatePicker(true);
      setDatePickerMode('start');
      return;
    }

    onFilterChange({
      status: value as BoletoStatus | 'ALL',
      dateRange: selectedDateRange,
      search: searchText,
    });
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onFilterChange({
      status: selectedStatus,
      dateRange: selectedDateRange,
      search: text,
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      if (datePickerMode === 'start') {
        const newRange = { ...tempDateRange, start: date };
        setTempDateRange(newRange);
        if (Platform.OS === 'ios') {
          setDatePickerMode('end');
        } else {
          onFilterChange({
            status: selectedStatus,
            dateRange: newRange,
            search: searchText,
          });
        }
      } else {
        const newRange = { ...tempDateRange, end: date };
        setTempDateRange(newRange);
        setShowDatePicker(false);
        onFilterChange({
          status: selectedStatus,
          dateRange: newRange,
          search: searchText,
        });
      }
    }
  };

  const formatDateRange = () => {
    if (!tempDateRange?.start) return 'Este Mês';
    const start = tempDateRange.start;
    const day = start.getDate().toString().padStart(2, '0');
    const month = (start.getMonth() + 1).toString().padStart(2, '0');
    return `De ${day}/${month} ▼`;
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busque fornecedor"
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={handleSearchChange}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => handleSearchChange('')}
            style={styles.clearButton}
          >
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsScroll}
      >
        {filters.map((filter, index) => {
          const isSelected =
            filter.value === selectedStatus ||
            (filter.value === 'DATE' && selectedDateRange !== null);

          return (
            <FilterChip
              key={filter.id}
              filter={filter}
              index={index}
              isSelected={isSelected}
              selectedStatus={selectedStatus}
              onPress={handleFilterPress}
              formatDateRange={formatDateRange}
            />
          );
        })}
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {datePickerMode === 'start' ? 'Data Inicial' : 'Data Final'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDateRange?.[datePickerMode] || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              locale="pt-BR"
            />
            {Platform.OS === 'ios' && datePickerMode === 'start' && (
              <TouchableOpacity
                style={styles.modalNextButton}
                onPress={() => setDatePickerMode('end')}
              >
                <Text style={styles.modalNextButtonText}>Próximo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  chipsScroll: {
    maxHeight: 50,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextSelected: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalNextButton: {
    backgroundColor: '#A7B758',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalNextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

