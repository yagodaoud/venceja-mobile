import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategories } from '@/hooks/useCategories';
import { useTranslation } from 'react-i18next';
import { Categoria } from '@/types';
import { Plus, Edit, Trash2, X } from 'lucide-react-native';
import { Dialog, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ScreenHeader from '@/components/ScreenHeader';
import { commonStyles, colors, spacing, shadows, modalStyles } from '@/styles';
import { useModalStore } from '@/store/modalStore';
import ColorPicker from '@/components/ColorPicker';
import { CategoryCardSkeleton } from '@/components/Skeleton';
import { formatDate } from '@/lib/utils';

const categorySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida (use formato #RRGGBB)'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const { categories, isLoading, refetch, createCategory, updateCategory, deleteCategory } = useCategories();
  const { setModalOpen } = useModalStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Categoria | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
      cor: '#A7B758',
    },
  });

  const handleCreate = () => {
    setEditingCategory(null);
    reset({ nome: '', cor: '#A7B758' });
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

  useEffect(() => {
    setModalOpen(modalVisible);
  }, [modalVisible, setModalOpen]);

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategory({ id: editingCategory.id, data }, {
        onSuccess: () => {
          setModalVisible(false);
          reset();
        },
      });
    } else {
      createCategory(data, {
        onSuccess: () => {
          setModalVisible(false);
          reset();
        },
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Categoria }) => (
    <View
      style={[
        commonStyles.card,
        {
          marginBottom: spacing.sm,
          marginHorizontal: spacing.lg,
          padding: spacing.md,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: item.cor }} />
          <Text style={{ fontSize: spacing.lg, fontWeight: '600', color: colors.text.primary, flex: 1 }}>
            {item.nome}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.lg, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Edit size={20} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      {item.createdAt && (
        <Text style={{ fontSize: spacing.sm, color: colors.text.tertiary, marginTop: spacing.xs }}>
          Criado em: {formatDate(item.createdAt)}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[commonStyles.screenContainer, { backgroundColor: '#FFFFFF' }]} edges={['top']}>
      <ScreenHeader
        title="Categorias"
        subtitle="Gerencie suas categorias"
        rightAction={{
          icon: <Plus size={24} color={colors.text.white} />,
          onPress: handleCreate,
        }}
      />

      {isLoading && !categories.length ? (
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
          }}
        >
          <CategoryCardSkeleton count={5} />
        </ScrollView>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={commonStyles.empty}>
              <Text style={commonStyles.emptyText}>{t('noCategories')}</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          reset();
        }}
        presentationStyle="overFullScreen"
        statusBarTranslucent
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.modal, { paddingBottom: spacing.xxxxl }]}>
            <View style={modalStyles.headerNoBorder}>
              <Text style={modalStyles.title}>
                {editingCategory ? t('editCategory') : t('createCategory')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  reset();
                }}
                style={modalStyles.closeButton}
              >
                <X size={24} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
              <View style={{ gap: spacing.xl }}>
                <View>
                  <Text
                    style={{
                      fontSize: spacing.md,
                      fontWeight: '600',
                      color: colors.text.secondary,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {t('categoryName')}
                  </Text>
                  <Controller
                    control={control}
                    name="nome"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="Nome da categoria"
                        style={{
                          ...commonStyles.input,
                          borderColor: errors.nome ? colors.error : colors.border,
                        }}
                      />
                    )}
                  />
                  {errors.nome && (
                    <Text style={commonStyles.errorText}>{errors.nome.message}</Text>
                  )}
                </View>

                <View>
                  <Controller
                    control={control}
                    name="cor"
                    render={({ field: { onChange, value } }) => (
                      <ColorPicker selectedColor={value} onColorSelect={onChange} />
                    )}
                  />
                  {errors.cor && (
                    <Text style={commonStyles.errorText}>{errors.cor.message}</Text>
                  )}
                </View>
              </View>
            </ScrollView>

            <View style={modalStyles.actionsNoBorder}>
              <TouchableOpacity
                style={[modalStyles.actionButton, modalStyles.actionButtonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  reset();
                }}
              >
                <Text style={[modalStyles.actionButtonText, modalStyles.actionButtonTextCancel]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.actionButton, modalStyles.actionButtonPrimary]}
                onPress={handleSubmit(onSubmit)}
              >
                <Text style={[modalStyles.actionButtonText, modalStyles.actionButtonTextPrimary]}>
                  {editingCategory ? t('update') : t('create')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

