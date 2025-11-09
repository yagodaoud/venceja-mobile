import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('email')}</Text>
            <Text style={styles.settingValue}>{user?.email}</Text>
          </View>
          {user?.cnpj && (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>CNPJ</Text>
              <Text style={styles.settingValue}>{user.cnpj}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setPasswordModalVisible(true)}
          >
            <Text style={styles.settingLabel}>{t('changePassword')}</Text>
            <Text style={styles.settingAction}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setCnpjModalVisible(true)}
          >
            <Text style={styles.settingLabel}>{t('updateCNPJ')}</Text>
            <Text style={styles.settingAction}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('darkMode')}</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              // TODO: Implement dark mode toggle
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#F44336" />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>

        {/* TODO: Future features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recursos Futuros</Text>
          <Text style={styles.todoText}>• Biometria (expo-local-authentication)</Text>
          <Text style={styles.todoText}>• Scanner de código de barras (expo-barcode-scanner)</Text>
          <Text style={styles.todoText}>• Notificações push completas (expo-notifications com webhook)</Text>
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
              style={styles.input}
            />
          )}
        />
        {errors.currentPassword && (
          <Text style={styles.error}>{errors.currentPassword.message}</Text>
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
              style={styles.input}
            />
          )}
        />
        {errors.newPassword && (
          <Text style={styles.error}>{errors.newPassword.message}</Text>
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
              style={styles.input}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword.message}</Text>
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
          style={styles.input}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingLabel: {
    fontSize: 16,
    color: '#212121',
  },
  settingValue: {
    fontSize: 16,
    color: '#757575',
  },
  settingAction: {
    fontSize: 20,
    color: '#757575',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  todoText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 8,
  },
  error: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 8,
  },
});

