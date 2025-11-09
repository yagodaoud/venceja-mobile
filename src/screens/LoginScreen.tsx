import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows, typography } from '@/styles';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  // Convert HSL to RGB for LinearGradient
  const primaryGreen = colors.primary;
  const primaryGreenLight = colors.primaryLight;
  const primaryGreenLighter = colors.primaryLighter;
  const mutedForeground = colors.text.light;
  const destructive = colors.error;
  const borderColor = colors.borderLight;

  // Custom theme for TextInput to ensure black text
  const inputTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      text: colors.text.secondary,
      onSurface: colors.text.secondary,
    },
  };

  return (
    <View style={styles.container}>
      {/* Subtle Gradient Background */}
      <LinearGradient
        colors={[primaryGreen, primaryGreenLight, primaryGreenLighter]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            bounces={false}
          >
            <View style={styles.content}>
              {/* Logo and Branding Section */}
              <View style={styles.brandingContainer}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoText}>V</Text>
                </View>
                <Text style={styles.title}>VenceJá</Text>
                <Text style={styles.subtitle}>
                  Gerencie seus boletos de forma simples e eficiente
                </Text>
              </View>

              {/* Login Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('login')}</Text>
                <Text style={styles.cardSubtitle}>
                  Entre com suas credenciais para continuar
                </Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputLabel}>
                    <Mail size={16} color={mutedForeground} />
                    <Text style={styles.labelText}>{t('email')}</Text>
                  </View>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        label=""
                        value={value}
                        onChangeText={onChange}
                        error={!!errors.email}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                        placeholder="seu@email.com"
                        placeholderTextColor={mutedForeground}
                        outlineColor={errors.email ? destructive : borderColor}
                        activeOutlineColor={errors.email ? destructive : primaryGreen}
                        style={styles.input}
                        theme={inputTheme}
                      />
                    )}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputLabel}>
                    <Lock size={16} color={mutedForeground} />
                    <Text style={styles.labelText}>{t('password')}</Text>
                  </View>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        label=""
                        value={value}
                        onChangeText={onChange}
                        error={!!errors.password}
                        mode="outlined"
                        secureTextEntry={!isPasswordVisible}
                        autoCapitalize="none"
                        autoComplete="password"
                        textContentType="password"
                        placeholder="••••••••"
                        placeholderTextColor={mutedForeground}
                        outlineColor={errors.password ? destructive : borderColor}
                        activeOutlineColor={errors.password ? destructive : primaryGreen}
                        style={styles.input}
                        theme={inputTheme}
                        right={
                          <TextInput.Icon
                            icon={isPasswordVisible ? 'eye-off' : 'eye'}
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                          />
                        }
                      />
                    )}
                  />
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password.message}</Text>
                  )}
                </View>

                {/* Login Button */}
                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                >
                  {isLoading ? (
                    <Text style={styles.buttonText}>Entrando...</Text>
                  ) : (
                    <>
                      <Text style={styles.buttonText}>{t('enter')}</Text>
                      <ArrowRight size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    </>
                  )}
                </Pressable>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Ao continuar, você concorda com nossos termos de uso
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.05,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxxxl,
    paddingBottom: spacing.xxxxxl,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxxxl,
  },
  logoContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xxl,
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: typography.sizes.huge,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -1,
  },
  title: {
    fontSize: typography.sizes.huge,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.light,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.light,
    marginBottom: spacing.xxl,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelText: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  input: {
    fontSize: typography.sizes.lg,
    backgroundColor: colors.background.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginTop: 6,
    marginLeft: spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text.white,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  buttonIcon: {
    marginLeft: spacing.xs,
  },
  footer: {
    marginTop: spacing.xxxxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
    textAlign: 'center',
  },
});
