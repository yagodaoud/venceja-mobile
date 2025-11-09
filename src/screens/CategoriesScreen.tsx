import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategories } from '@/hooks/useCategories';
import { useTranslation } from 'react-i18next';
import { Categoria } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react-native';
import { Dialog, TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View style={[styles.colorSwatch, { backgroundColor: item.cor }]} />
        <Text style={styles.categoryName}>{item.nome}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Edit size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Trash2 size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('categories')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Plus size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('noCategories')}</Text>
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
              style={styles.input}
            />
          )}
        />
        {errors.nome && (
          <Text style={styles.error}>{errors.nome.message}</Text>
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
                style={styles.input}
                placeholder="#4CAF50"
              />
              <View style={[styles.colorPreview, { backgroundColor: value }]} />
            </View>
          )}
        />
        {errors.cor && (
          <Text style={styles.error}>{errors.cor.message}</Text>
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
          <Text style={styles.modalText}>{t('confirmDeleteMessage')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDeleteModalVisible(false)}>{t('cancel')}</Button>
          <Button onPress={confirmDelete} textColor="#F44336">
            {t('delete')}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
  modalText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  error: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 8,
  },
  colorPreview: {
    width: '100%',
    height: 40,
    borderRadius: 4,
    marginTop: 8,
  },
});

