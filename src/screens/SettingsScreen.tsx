import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogOut } from 'lucide-react-native';
import { Dialog } from 'react-native-paper';
import { commonStyles, colors, spacing } from '@/styles';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [cnpjModalVisible, setCnpjModalVisible] = useState(false);
  const [newCnpj, setNewCnpj] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleChangePassword = (data: PasswordFormData) => {
    // TODO: Implement password change API call
    console.log('Change password:', data);
    setPasswordModalVisible(false);
    reset();
    // Toast.show({
    //   type: 'success',
    //   text1: t('success'),
    //   text2: t('passwordUpdated'),
    // });
  };

  const handleUpdateCNPJ = () => {
    // TODO: Implement CNPJ update API call
    console.log('Update CNPJ:', newCnpj);
    setCnpjModalVisible(false);
    setNewCnpj('');
    // Toast.show({
    //   type: 'success',
    //   text1: t('success'),
    //   text2: t('cnpjUpdated'),
    // });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={['top']}>
      <View style={{ padding: spacing.lg, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={commonStyles.screenTitle}>{t('settings')}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Conta</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.background.secondary }}>
            <Text style={{ fontSize: spacing.lg, color: colors.text.primary }}>{t('email')}</Text>
            <Text style={{ fontSize: spacing.lg, color: colors.text.tertiary }}>{user?.email}</Text>
          </View>
          {user?.cnpj && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.background.secondary }}>
              <Text style={{ fontSize: spacing.lg, color: colors.text.primary }}>CNPJ</Text>
              <Text style={{ fontSize: spacing.lg, color: colors.text.tertiary }}>{user.cnpj}</Text>
            </View>
          )}
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Segurança</Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.background.secondary }}
            onPress={() => setPasswordModalVisible(true)}
          >
            <Text style={{ fontSize: spacing.lg, color: colors.text.primary }}>{t('changePassword')}</Text>
            <Text style={{ fontSize: spacing.xxl, color: colors.text.tertiary }}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.background.secondary }}
            onPress={() => setCnpjModalVisible(true)}
          >
            <Text style={{ fontSize: spacing.lg, color: colors.text.primary }}>{t('updateCNPJ')}</Text>
            <Text style={{ fontSize: spacing.xxl, color: colors.text.tertiary }}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Aparência</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.background.secondary }}>
            <Text style={{ fontSize: spacing.lg, color: colors.text.primary }}>{t('darkMode')}</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              // TODO: Implement dark mode toggle
            />
          </View>
        </View>

        <View style={commonStyles.section}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.destructiveLight, borderRadius: spacing.sm, gap: spacing.sm }}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={{ fontSize: spacing.lg, fontWeight: '600', color: colors.error }}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>

        {/* TODO: Future features */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Recursos Futuros</Text>
          <Text style={{ fontSize: spacing.md, color: colors.text.tertiary, marginBottom: spacing.sm, fontStyle: 'italic' }}>• Biometria (expo-local-authentication)</Text>
          <Text style={{ fontSize: spacing.md, color: colors.text.tertiary, marginBottom: spacing.sm, fontStyle: 'italic' }}>• Scanner de código de barras (expo-barcode-scanner)</Text>
          <Text style={{ fontSize: spacing.md, color: colors.text.tertiary, marginBottom: spacing.sm, fontStyle: 'italic' }}>• Notificações push completas (expo-notifications com webhook)</Text>
        </View>
      </ScrollView>

      <Dialog
        visible={passwordModalVisible}
        onDismiss={() => {
          setPasswordModalVisible(false);
          reset();
        }}
      >
        <Dialog.Title>{t('changePassword')}</Dialog.Title>
        <Dialog.Content>

        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label={t('currentPassword')}
              value={value}
              onChangeText={onChange}
              error={!!errors.currentPassword}
              mode="outlined"
              secureTextEntry
              style={commonStyles.input}
            />
          )}
        />
        {errors.currentPassword && (
          <Text style={commonStyles.errorText}>{errors.currentPassword.message}</Text>
        )}

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label={t('newPassword')}
              value={value}
              onChangeText={onChange}
              error={!!errors.newPassword}
              mode="outlined"
              secureTextEntry
              style={commonStyles.input}
            />
          )}
        />
        {errors.newPassword && (
          <Text style={commonStyles.errorText}>{errors.newPassword.message}</Text>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label={t('confirmPassword')}
              value={value}
              onChangeText={onChange}
              error={!!errors.confirmPassword}
              mode="outlined"
              secureTextEntry
              style={commonStyles.input}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={commonStyles.errorText}>{errors.confirmPassword.message}</Text>
        )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setPasswordModalVisible(false)}>{t('cancel')}</Button>
          <Button onPress={handleSubmit(handleChangePassword)} mode="contained">
            {t('update')}
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={cnpjModalVisible}
        onDismiss={() => {
          setCnpjModalVisible(false);
          setNewCnpj('');
        }}
      >
        <Dialog.Title>{t('updateCNPJ')}</Dialog.Title>
        <Dialog.Content>

        <TextInput
          label="CNPJ"
          value={newCnpj}
          onChangeText={setNewCnpj}
          mode="outlined"
          keyboardType="numeric"
          style={commonStyles.input}
          placeholder="00.000.000/0000-00"
        />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setCnpjModalVisible(false)}>{t('cancel')}</Button>
          <Button onPress={handleUpdateCNPJ} mode="contained">
            {t('update')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </SafeAreaView>
  );
}

