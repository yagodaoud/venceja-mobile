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
  const primaryGreen = '#4CAF50'; // hsl(122, 39%, 49%)
  const primaryGreenLight = '#66BB6A'; // hsl(122, 39%, 55%)
  const primaryGreenLighter = '#81C784'; // hsl(122, 35%, 60%)
  const mutedForeground = '#6B7280'; // hsl(215.4, 16.3%, 46.9%)
  const destructive = '#EF4444'; // hsl(0, 84.2%, 60.2%)
  const borderColor = '#E5E7EB'; // hsl(214.3, 31.8%, 91.4%)

  // Custom theme for TextInput to ensure black text
  const inputTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      text: '#111827',
      onSurface: '#111827',
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
    backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4CAF50',
    letterSpacing: -1,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  input: {
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
