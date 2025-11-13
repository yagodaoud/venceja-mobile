import React, { useEffect } from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    withSequence,
    withRepeat,
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows, typography } from '@/styles';

interface LoadingModalProps {
    visible: boolean;
    message?: string;
}

export default function LoadingModal({ visible, message = 'Processando imagem...' }: LoadingModalProps) {
    const opacity = useSharedValue(0); // Agora apenas usamos opacity
    const sparkleRotation = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // Fade-in suave apenas com opacity
            opacity.value = withTiming(1, { duration: 300, easing: Easing.ease });

            // Manter a rotação dos "sparkles"
            sparkleRotation.value = withRepeat(
                withSequence(
                    withTiming(10, { duration: 200, easing: Easing.ease }),
                    withTiming(-10, { duration: 200, easing: Easing.ease })
                ),
                -1,
                true
            );
        } else {
            // Fade-out suave
            opacity.value = withTiming(0, { duration: 300, easing: Easing.ease });

            // Resetar rotação ao fechar
            sparkleRotation.value = 0;
        }
    }, [visible]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const animatedSparkleStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${sparkleRotation.value}deg` }],
    }));

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
            <View style={styles.overlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                <Animated.View style={[styles.container, animatedContainerStyle]}>
                    <View style={styles.iconContainer}>
                        <Animated.View style={animatedSparkleStyle}>
                            <Sparkles size={32} color={colors.primary} strokeWidth={2.5} />
                        </Animated.View>
                    </View>

                    <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />

                    <Text style={styles.message}>{message}</Text>
                    <Text style={styles.submessage}>Isso pode levar alguns segundos</Text>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.xl,
        padding: spacing.xxxl,
        alignItems: 'center',
        minWidth: 280,
        maxWidth: '80%',
        ...shadows.lg,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primaryLightest,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    spinner: {
        marginVertical: spacing.md,
    },
    message: {
        fontSize: typography.sizes.lg,
        fontWeight: '600' as '600',
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    submessage: {
        fontSize: typography.sizes.sm,
        color: colors.text.tertiary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
});
