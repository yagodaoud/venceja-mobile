import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarIcon, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from '@/lib/utils';
import CustomCalendar from './CustomCalendar';

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

interface SingleDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
}

const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

export const DateRangePicker = ({ dateRange, onDateRangeChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    onDateRangeChange(undefined);
  };

  const handleRangeSelect = (start: Date, end: Date) => {
    onDateRangeChange({ from: start, to: end });
  };

  const displayText = dateRange?.from
    ? dateRange.to
      ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
      : formatDate(dateRange.from)
    : 'Selecione um período';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          dateRange?.from && styles.buttonWithClear
        ]}
        onPress={() => setIsOpen(true)}
      >
        <CalendarIcon size={20} color="#4CAF50" />
        <Text style={[styles.buttonText, !dateRange?.from && styles.buttonTextPlaceholder]}>
          {displayText}
        </Text>
      </TouchableOpacity>

      {dateRange?.from && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <X size={16} color="#757575" />
        </TouchableOpacity>
      )}

      <CustomCalendar
        visible={isOpen}
        mode="range"
        startDate={dateRange?.from}
        endDate={dateRange?.to}
        onRangeSelect={handleRangeSelect}
        onClose={() => setIsOpen(false)}
      />
    </View>
  );
};

export const SingleDatePicker = ({ date, onDateChange, placeholder = 'Selecione uma data' }: SingleDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    onDateChange(undefined);
  };

  const handleDateSelect = (selectedDate: Date) => {
    onDateChange(selectedDate);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          date && styles.buttonWithClear
        ]}
        onPress={() => setIsOpen(true)}
      >
        <CalendarIcon size={20} color="#4CAF50" />
        <Text style={[styles.buttonText, !date && styles.buttonTextPlaceholder]}>
          {date ? formatDate(date) : placeholder}
        </Text>
      </TouchableOpacity>

      {date && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <X size={16} color="#757575" />
        </TouchableOpacity>
      )}

      <CustomCalendar
        visible={isOpen}
        selectedDate={date}
        onDateSelect={handleDateSelect}
        onClose={() => setIsOpen(false)}
        mode="single"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  buttonWithClear: {
    paddingRight: 40,
  },
  buttonText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  buttonTextPlaceholder: {
    color: '#9CA3AF',
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    padding: 4,
    zIndex: 1,
  },
});

