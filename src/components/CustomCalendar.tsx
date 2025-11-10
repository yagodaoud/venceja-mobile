import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CustomCalendarProps {
  visible: boolean;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  mode?: 'single' | 'range';
  startDate?: Date;
  endDate?: Date;
  onRangeSelect?: (start: Date, end: Date) => void;
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function CustomCalendar({
  visible,
  selectedDate,
  onDateSelect,
  onClose,
  mode = 'single',
  startDate,
  endDate,
  onRangeSelect,
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate);
  const [selectingStart, setSelectingStart] = useState(true);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDatePress = (date: Date) => {
    if (mode === 'range') {
      if (selectingStart || !tempStartDate) {
        setTempStartDate(date);
        setTempEndDate(undefined);
        setSelectingStart(false);
      } else {
        if (date < tempStartDate!) {
          setTempStartDate(date);
          setTempEndDate(tempStartDate!);
        } else {
          setTempEndDate(date);
        }
      }
    } else {
      onDateSelect(date);
      onClose();
    }
  };

  const handleConfirmRange = () => {
    if (tempStartDate && tempEndDate && onRangeSelect) {
      onRangeSelect(tempStartDate, tempEndDate);
      onClose();
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isDateSelected = (date: Date): boolean => {
    if (mode === 'range') {
      if (!tempStartDate) return false;
      if (tempEndDate) {
        return (date >= tempStartDate && date <= tempEndDate) || isSameDay(date, tempStartDate) || isSameDay(date, tempEndDate);
      }
      return isSameDay(date, tempStartDate);
    }
    return selectedDate ? isSameDay(date, selectedDate) : false;
  };

  const isDateInRange = (date: Date): boolean => {
    if (mode === 'range' && tempStartDate && tempEndDate) {
      return date > tempStartDate && date < tempEndDate;
    }
    return false;
  };

  const isStartDate = (date: Date): boolean => {
    return mode === 'range' && tempStartDate ? isSameDay(date, tempStartDate) : false;
  };

  const isEndDate = (date: Date): boolean => {
    return mode === 'range' && tempEndDate ? isSameDay(date, tempEndDate) : false;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'range' ? 'Selecione o período' : 'Selecione uma data'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
              <ChevronLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <ChevronRight size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDays}>
            {weekDays.map((day) => (
              <View key={day} style={styles.weekDay}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.daysContainer}>
            {days.map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = isDateSelected(date);
              const inRange = isDateInRange(date);
              const isStart = isStartDate(date);
              const isEnd = isEndDate(date);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.day,
                    !isCurrentMonth && styles.dayOtherMonth,
                    isSelected && styles.daySelected,
                    inRange && styles.dayInRange,
                    isStart && styles.dayStart,
                    isEnd && styles.dayEnd,
                  ]}
                  onPress={() => handleDatePress(date)}
                  disabled={!isCurrentMonth}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !isCurrentMonth && styles.dayTextOtherMonth,
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {format(date, 'd')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {mode === 'range' && (
            <View style={styles.rangeActions}>
              <TouchableOpacity
                style={[styles.confirmButton, (!tempStartDate || !tempEndDate) && styles.confirmButtonDisabled]}
                onPress={handleConfirmRange}
                disabled={!tempStartDate || !tempEndDate}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayOtherMonth: {
    opacity: 0.3,
  },
  daySelected: {
    backgroundColor: '#A7B758',
    borderRadius: 8,
  },
  dayInRange: {
    backgroundColor: '#F0F4E0', // Light olive green to match primary theme
  },
  dayStart: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  dayEnd: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: '#111827',
  },
  dayTextOtherMonth: {
    color: '#9CA3AF',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  rangeActions: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#A7B758',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

