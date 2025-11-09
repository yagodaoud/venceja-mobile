import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { ForkKnife, Bell, Clock } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing } from '@/styles';

interface EngagingHeaderProps {
  expiringTodayCount?: number;
  pendingCount?: number;
  onBellPress?: () => void;
}

export default function EngagingHeader({
  expiringTodayCount = 0,
  pendingCount = 0,
  onBellPress,
}: EngagingHeaderProps) {
  const { user } = useAuthStore();
  const fadeIn = useSharedValue(0);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    // Fade-in animation for greeting
    fadeIn.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  useEffect(() => {
    // Pulse animation for expiring count chip
    if (expiringTodayCount > 0) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 750, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [expiringTodayCount]);

  const greetingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const userName = user?.email?.split('@')[0] || 'Usuário';
  const hasExpiring = expiringTodayCount > 0;
  const hasPending = pendingCount > 0;

  return (
    <LinearGradient
      colors={[colors.primaryLightest, colors.background.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Row: Logo and Bell */}
          <View style={styles.topRow}>
            <View style={styles.logoContainer}>
              <ForkKnife size={24} color={colors.primary} strokeWidth={2} />
              <Text style={styles.logoText}>VenceJá</Text>
            </View>

            <TouchableOpacity
              style={styles.bellContainer}
              onPress={onBellPress}
              activeOpacity={0.7}
            >
              <Bell size={24} color={colors.text.secondary} />
              {hasPending && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <Animated.View style={[styles.greetingContainer, greetingAnimatedStyle]}>
            <Text style={styles.greeting}>Olá, {userName}!</Text>
            <Text style={styles.subtitle}>Boletos sob controle</Text>
          </Animated.View>

          {/* Metrics Chip */}
          {hasExpiring && (
            <Animated.View style={[styles.metricsChip, pulseAnimatedStyle]}>
              <Clock size={14} color={colors.error} />
              <Text style={styles.metricsText}>
                {expiringTodayCount} vencendo hoje
              </Text>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: 140,
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoText: {
    fontSize: spacing.xxl,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: -0.5,
  },
  bellContainer: {
    position: 'relative',
    padding: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.text.white,
  },
  badgeText: {
    color: colors.text.white,
    fontSize: spacing.xs + 2,
    fontWeight: '700',
  },
  greetingContainer: {
    marginBottom: spacing.sm,
  },
  greeting: {
    fontSize: spacing.xl,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: spacing.md,
    color: colors.text.light,
  },
  metricsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.destructiveLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: spacing.lg,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.destructiveBorder,
  },
  metricsText: {
    fontSize: spacing.sm,
    fontWeight: '600',
    color: colors.error,
  },
});

