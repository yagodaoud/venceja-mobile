import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Categoria } from '@/types';
import { useTranslation } from 'react-i18next';

interface CategoryPickerProps {
  categories: Categoria[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategoryPicker({ categories, selectedId, onSelect }: CategoryPickerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('category')}</Text>
      <TouchableOpacity
        style={[styles.option, !selectedId && styles.selectedOption]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.optionText, !selectedId && styles.selectedText]}>
          {t('all')}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.option,
              styles.categoryOption,
              selectedId === item.id && styles.selectedOption,
            ]}
            onPress={() => onSelect(item.id)}
          >
            <View style={[styles.colorDot, { backgroundColor: item.cor }]} />
            <Text
              style={[styles.optionText, selectedId === item.id && styles.selectedText]}
              numberOfLines={1}
            >
              {item.nome}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#757575',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

