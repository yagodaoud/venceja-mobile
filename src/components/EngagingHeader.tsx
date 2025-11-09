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
      colors={['#E8F5E8', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Row: Logo and Bell */}
          <View style={styles.topRow}>
            <View style={styles.logoContainer}>
              <ForkKnife size={24} color="#4CAF50" strokeWidth={2} />
              <Text style={styles.logoText}>VenceJá</Text>
            </View>

            <TouchableOpacity
              style={styles.bellContainer}
              onPress={onBellPress}
              activeOpacity={0.7}
            >
              <Bell size={24} color="#111827" />
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
              <Clock size={14} color="#F44336" />
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  bellContainer: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  greetingContainer: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  metricsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  metricsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F44336',
  },
});

