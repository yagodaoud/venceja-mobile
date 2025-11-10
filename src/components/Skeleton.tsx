import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing } from '@/styles';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  count?: number;
}

export function BoletoCardSkeleton({ count = 3 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: colors.background.primary,
            borderRadius: 12,
            padding: spacing.lg,
            marginHorizontal: spacing.lg,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <Skeleton width={120} height={20} borderRadius={4} />
            <Skeleton width={80} height={20} borderRadius={4} />
          </View>
          <Skeleton width="70%" height={16} borderRadius={4} style={{ marginBottom: spacing.sm }} />
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
            <Skeleton width={100} height={16} borderRadius={4} />
            <Skeleton width={80} height={16} borderRadius={4} />
          </View>
        </View>
      ))}
    </>
  );
}

export function CategoryCardSkeleton({ count = 5 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: colors.background.primary,
            borderRadius: 12,
            padding: spacing.lg,
            marginHorizontal: spacing.lg,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
            <Skeleton width={32} height={32} borderRadius={16} />
            <Skeleton width={120} height={20} borderRadius={4} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.lg }}>
            <Skeleton width={20} height={20} borderRadius={4} />
            <Skeleton width={20} height={20} borderRadius={4} />
          </View>
        </View>
      ))}
    </>
  );
}

export function ReportsSkeleton() {
  return (
    <>
      {/* Summary Cards Skeleton */}
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxl }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background.primary,
            borderRadius: 12,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
          }}
        >
          <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: spacing.sm }} />
          <Skeleton width={120} height={28} borderRadius={4} />
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background.primary,
            borderRadius: 12,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
          }}
        >
          <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: spacing.sm }} />
          <Skeleton width={120} height={28} borderRadius={4} />
        </View>
      </View>

      {/* Chart Card Skeleton */}
      <View
        style={{
          backgroundColor: colors.background.primary,
          borderRadius: 12,
          padding: spacing.xl,
          marginBottom: spacing.xxl,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Skeleton width={200} height={24} borderRadius={4} style={{ marginBottom: spacing.sm }} />
        <Skeleton width={150} height={16} borderRadius={4} style={{ marginBottom: spacing.xxl }} />
        
        {/* Chart circle skeleton */}
        <View style={{ alignItems: 'center', marginVertical: spacing.xl }}>
          <Skeleton width={200} height={200} borderRadius={100} />
        </View>

        {/* Legend skeleton */}
        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Skeleton width={12} height={12} borderRadius={6} />
              <Skeleton width={120} height={16} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

