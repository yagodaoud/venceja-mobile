import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors as appColors, spacing, borderRadius } from '@/styles';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

// Pretty color palette
const colorPalette = [
  '#A7B758', // Olive Green
  '#2196F3', // Blue
  '#FF9800', // Orange
  '#F44336', // Red
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#FFEB3B', // Yellow
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#E91E63', // Pink
  '#3F51B5', // Indigo
  '#009688', // Teal
  '#FF5722', // Deep Orange
  '#8BC34A', // Light Green
  '#FFC107', // Amber
  '#673AB7', // Deep Purple
  '#CDDC39', // Lime
  '#FF4081', // Pink Accent
  '#00E676', // Green Accent
  '#18FFFF', // Cyan Accent
];

export default function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <View>
      <Text
        style={{
          fontSize: spacing.md,
          fontWeight: '600',
          color: appColors.text.secondary,
          marginBottom: spacing.md,
        }}
      >
        Escolha uma cor
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        {colorPalette.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => onColorSelect(color)}
            style={{
              width: 48,
              height: 48,
              borderRadius: borderRadius.full,
              backgroundColor: color,
              borderWidth: selectedColor === color ? 3 : 2,
              borderColor: selectedColor === color ? appColors.primary : appColors.border,
              ...(selectedColor === color && {
                shadowColor: appColors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }),
            }}
          >
            {selectedColor === color && (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: appColors.text.white,
                  }}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View
        style={{
          marginTop: spacing.sm,
          padding: spacing.lg,
          borderRadius: borderRadius.md,
          backgroundColor: appColors.background.secondary,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: borderRadius.full,
            backgroundColor: selectedColor,
            marginBottom: spacing.sm,
            borderWidth: 2,
            borderColor: appColors.border,
          }}
        />
        <Text style={{ fontSize: spacing.sm, color: appColors.text.tertiary, fontWeight: '600' }}>
          {selectedColor}
        </Text>
      </View>
    </View>
  );
}

