import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBoletos } from '@/hooks/useBoletos';
import { useTranslation } from 'react-i18next';
import { Boleto, BoletoStatus } from '@/types';
import BoletoCard from '@/components/BoletoCard';
import PaymentModal from '@/components/PaymentModal';
import { Picker } from '@react-native-picker/picker';
import { Filter, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getDateRange } from '@/lib/utils';
import { Dialog, Button as PaperButton } from 'react-native-paper';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [statusFilter, setStatusFilter] = useState<BoletoStatus | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<'este-mes' | 'ultimos-3-meses' | 'custom' | null>('este-mes');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedBoleto, setSelectedBoleto] = useState<Boleto | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const range = dateRange && dateRange !== 'custom' ? getDateRange(dateRange) : { inicio: '', fim: '' };

  const filters = {
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    dataInicio: range.inicio || undefined,
    dataFim: range.fim || undefined,
    sortBy: 'vencimento',
    direction: 'asc' as const,
    page: 0,
    size: 20,
  };

  const { boletos, isLoading, refetch, markPaid, deleteBoleto } = useBoletos(filters);

  const handleMarkPaid = (boleto: Boleto) => {
    setSelectedBoleto(boleto);
    setPaymentModalVisible(true);
  };

  const handleEdit = (boleto: Boleto) => {
    // Navigate to edit screen or open edit modal
    setSelectedBoleto(boleto);
    setEditModalVisible(true);
  };

  const handleDelete = (boleto: Boleto) => {
    setSelectedBoleto(boleto);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedBoleto) {
      deleteBoleto(selectedBoleto.id);
      setDeleteModalVisible(false);
      setSelectedBoleto(null);
    }
  };

  const handleScanPress = () => {
    (navigation as any).navigate('Scan');
  };

  const renderItem = ({ item }: { item: Boleto }) => (
    <BoletoCard
      boleto={item}
      onPress={() => handleEdit(item)}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item)}
      onMarkPaid={() => handleMarkPaid(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('dashboard')}</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanPress}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color="#4CAF50" />
          <Text style={styles.filterText}>{t('filterByStatus')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={boletos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('noBoletos')}</Text>
          </View>
        }
      />

      <PaymentModal
        visible={paymentModalVisible}
        boleto={selectedBoleto}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedBoleto(null);
        }}
      />

      <Dialog visible={showFilterModal} onDismiss={() => setShowFilterModal(false)}>
        <Dialog.Title>{t('filterByStatus')}</Dialog.Title>
        <Dialog.Content>
          <Picker
            selectedValue={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
            style={styles.picker}
          >
            <Picker.Item label={t('all')} value="ALL" />
            <Picker.Item label={t('pending')} value="PENDENTE" />
            <Picker.Item label={t('expired')} value="VENCIDO" />
            <Picker.Item label={t('paid')} value="PAGO" />
          </Picker>
        </Dialog.Content>
        <Dialog.Actions>
          <PaperButton onPress={() => setShowFilterModal(false)}>{t('close')}</PaperButton>
        </Dialog.Actions>
      </Dialog>

      <Dialog visible={deleteModalVisible} onDismiss={() => setDeleteModalVisible(false)}>
        <Dialog.Title>{t('confirmDelete')}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.modalText}>
            Tem certeza que deseja excluir este boleto?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <PaperButton onPress={() => setDeleteModalVisible(false)}>{t('cancel')}</PaperButton>
          <PaperButton onPress={confirmDelete} textColor="#F44336">
            {t('delete')}
          </PaperButton>
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
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filters: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  list: {
    paddingVertical: 8,
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
  picker: {
    width: '100%',
  },
});

