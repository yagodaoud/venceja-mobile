import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Categoria } from '@/types';
import { useTranslation } from 'react-i18next';

interface CategoryPickerProps {
  categories: Categoria[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  showLabel?: boolean;
}

type CategoryItem = Categoria | { id: null; nome: string; cor: string; isNone: true };

export default function CategoryPicker({ categories, selectedId, onSelect, showLabel = true }: CategoryPickerProps) {
  const { t } = useTranslation();

  // Create data array with "Nenhuma" option as first item, then categories
  const data: CategoryItem[] = [
    { id: null, nome: 'Nenhuma', cor: 'transparent', isNone: true },
    ...categories,
  ];

  const renderItem = ({ item }: { item: CategoryItem }) => {
    const isSelected = selectedId === item.id;
    const isNone = 'isNone' in item && item.isNone;
    
    return (
      <TouchableOpacity
        style={[
          styles.option,
          !isNone && styles.categoryOption,
          isSelected && styles.selectedOption,
        ]}
        onPress={() => onSelect(item.id)}
      >
        {!isNone && <View style={[styles.colorDot, { backgroundColor: item.cor }]} />}
        <Text
          style={[styles.optionText, isSelected && styles.selectedText]}
          numberOfLines={1}
        >
          {item.nome}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {showLabel && <Text style={styles.label}>{t('category')}</Text>}
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => (item.id === null ? 'none' : item.id.toString())}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingRight: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
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

