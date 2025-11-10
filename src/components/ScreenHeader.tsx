import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { commonStyles, colors, spacing, shadows } from '@/styles';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export default function ScreenHeader({ title, subtitle, rightAction, style }: ScreenHeaderProps) {
  return (
    <View style={[commonStyles.screenHeader, { borderBottomWidth: 0 }, style]}>
      <View>
        <Text style={[commonStyles.screenTitle, subtitle ? { marginBottom: spacing.xs } : {}]}>
          {title}
        </Text>
        {subtitle && <Text style={commonStyles.screenSubtitle}>{subtitle}</Text>}
      </View>
      {rightAction && (
        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            ...shadows.md,
          }}
          onPress={rightAction.onPress}
        >
          {rightAction.icon}
        </TouchableOpacity>
      )}
    </View>
  );
}

