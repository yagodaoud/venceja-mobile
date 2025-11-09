import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarIcon, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from '@/lib/utils';
import CustomCalendar from './CustomCalendar';
import { commonStyles, colors, spacing } from '@/styles';

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
    <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        style={[
          commonStyles.input,
          { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
          dateRange?.from && { paddingRight: spacing.xxxxl }
        ]}
        onPress={() => setIsOpen(true)}
      >
        <CalendarIcon size={20} color={colors.primary} />
        <Text style={[
          { fontSize: spacing.md, flex: 1 },
          dateRange?.from ? { color: colors.text.secondary } : { color: colors.text.lighter }
        ]}>
          {displayText}
        </Text>
      </TouchableOpacity>

      {dateRange?.from && (
        <TouchableOpacity
          style={{ position: 'absolute', right: spacing.sm, padding: spacing.xs, zIndex: 1 }}
          onPress={handleClear}
        >
          <X size={16} color={colors.text.tertiary} />
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
    <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        style={[
          commonStyles.input,
          { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
          date && { paddingRight: spacing.xxxxl }
        ]}
        onPress={() => setIsOpen(true)}
      >
        <CalendarIcon size={20} color={colors.primary} />
        <Text style={[
          { fontSize: spacing.md, flex: 1 },
          date ? { color: colors.text.secondary } : { color: colors.text.lighter }
        ]}>
          {date ? formatDate(date) : placeholder}
        </Text>
      </TouchableOpacity>

      {date && (
        <TouchableOpacity
          style={{ position: 'absolute', right: spacing.sm, padding: spacing.xs, zIndex: 1 }}
          onPress={handleClear}
        >
          <X size={16} color={colors.text.tertiary} />
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


