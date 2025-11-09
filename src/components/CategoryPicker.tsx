import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Categoria } from '@/types';
import { useTranslation } from 'react-i18next';
import { commonStyles, colors, spacing, borderRadius } from '@/styles';

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
          {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: colors.border,
            marginRight: spacing.sm,
            alignItems: 'center',
            justifyContent: 'center',
          },
          !isNone && { flexDirection: 'row', alignItems: 'center', gap: 6 },
          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
        onPress={() => onSelect(item.id)}
      >
        {!isNone && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.cor }} />}
        <Text
          style={[
            { fontSize: spacing.md, color: colors.text.tertiary },
            isSelected && { color: colors.text.white, fontWeight: '600' },
          ]}
          numberOfLines={1}
        >
          {item.nome}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginVertical: spacing.sm }}>
      {showLabel && <Text style={commonStyles.label}>{t('category')}</Text>}
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => (item.id === null ? 'none' : item.id.toString())}
        renderItem={renderItem}
        contentContainerStyle={{ paddingRight: spacing.sm }}
      />
    </View>
  );
}

