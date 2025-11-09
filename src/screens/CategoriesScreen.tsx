import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategories } from '@/hooks/useCategories';
import { useTranslation } from 'react-i18next';
import { Categoria } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react-native';
import { Dialog, TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { commonStyles, colors, spacing, shadows } from '@/styles';

const categorySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida (use formato #RRGGBB)'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Categoria | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nome: '',
      cor: '#4CAF50',
    },
  });

  const handleCreate = () => {
    setEditingCategory(null);
    reset({ nome: '', cor: '#4CAF50' });
    setModalVisible(true);
  };

  const handleEdit = (category: Categoria) => {
    setEditingCategory(category);
    setValue('nome', category.nome);
    setValue('cor', category.cor);
    setModalVisible(true);
  };

  const handleDelete = (category: Categoria) => {
    setDeletingCategory(category);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id);
      setDeleteModalVisible(false);
      setDeletingCategory(null);
    }
  };

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategory({ id: editingCategory.id, data });
    } else {
      createCategory(data);
    }
    setModalVisible(false);
    reset();
  };

  const renderItem = ({ item }: { item: Categoria }) => (
    <View style={[commonStyles.card, { marginBottom: spacing.sm, marginHorizontal: 0 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: item.cor }} />
        <Text style={{ fontSize: spacing.lg, fontWeight: '600', color: colors.text.primary, flex: 1 }}>
          {item.nome}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.lg }}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Edit size={20} color={colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={['top']}>
      <View style={commonStyles.screenHeader}>
        <Text style={commonStyles.screenTitle}>{t('categories')}</Text>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background.secondary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={handleCreate}
        >
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
          <View style={commonStyles.empty}>
            <Text style={commonStyles.emptyText}>{t('noCategories')}</Text>
          </View>
        }
      />

      <Dialog
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
          reset();
        }}
      >
        <Dialog.Title>
          {editingCategory ? t('editCategory') : t('createCategory')}
        </Dialog.Title>
        <Dialog.Content>

        <Controller
          control={control}
          name="nome"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label={t('categoryName')}
              value={value}
              onChangeText={onChange}
              error={!!errors.nome}
              mode="outlined"
              style={commonStyles.input}
            />
          )}
        />
        {errors.nome && (
          <Text style={commonStyles.errorText}>{errors.nome.message}</Text>
        )}

        <Controller
          control={control}
          name="cor"
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                label={t('categoryColor')}
                value={value}
                onChangeText={onChange}
                error={!!errors.cor}
                mode="outlined"
                style={commonStyles.input}
                placeholder="#4CAF50"
              />
              <View style={{ width: '100%', height: 40, borderRadius: 4, marginTop: spacing.sm, backgroundColor: value }} />
            </View>
          )}
        />
        {errors.cor && (
          <Text style={commonStyles.errorText}>{errors.cor.message}</Text>
        )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setModalVisible(false)}>{t('cancel')}</Button>
          <Button onPress={handleSubmit(onSubmit)} mode="contained">
            {editingCategory ? t('update') : t('create')}
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog visible={deleteModalVisible} onDismiss={() => setDeleteModalVisible(false)}>
        <Dialog.Title>{t('confirmDelete')}</Dialog.Title>
        <Dialog.Content>
          <Text style={{ fontSize: spacing.lg, color: colors.text.tertiary, marginBottom: spacing.lg }}>
            {t('confirmDeleteMessage')}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDeleteModalVisible(false)}>{t('cancel')}</Button>
          <Button onPress={confirmDelete} textColor={colors.error}>
            {t('delete')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </SafeAreaView>
  );
}

