import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBoletos } from '@/hooks/useBoletos';
import { useTranslation } from 'react-i18next';
import { Boleto, BoletoStatus } from '@/types';
import BoletoCard from '@/components/BoletoCard';
import PaymentModal from '@/components/PaymentModal';
import StatusDropdown from '@/components/StatusDropdown';
import { DateRangePicker } from '@/components/DatePicker';
import BoletoModal from '@/components/BoletoModal';
import AddBoletoModal from '@/components/AddBoletoModal';
import { Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DateRange, getCurrentMonthRange, getLastMonthRange, getLast3MonthsRange, getCurrentBimestreRange, areDateRangesEqual, toDDMMYYYY } from '@/lib/utils';
import { Dialog, Button as PaperButton } from 'react-native-paper';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [statusFilter, setStatusFilter] = useState<BoletoStatus | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getCurrentMonthRange());
  const [selectedBoleto, setSelectedBoleto] = useState<Boleto | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const filters = {
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    dataInicio: dateRange?.from ? toDDMMYYYY(dateRange.from) : undefined,
    dataFim: dateRange?.to ? toDDMMYYYY(dateRange.to) : undefined,
    sortBy: 'vencimento',
    direction: 'desc' as const,
    page: 0,
    size: 20,
  };

  const { boletos, isLoading, refetch, markPaid, deleteBoleto } = useBoletos(filters);

  const handleMarkPaid = (boleto: Boleto) => {
    setSelectedBoleto(boleto);
    setPaymentModalVisible(true);
  };

  const handleEdit = (boleto: Boleto) => {
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

  const handleCreateManual = () => {
    setSelectedBoleto(null);
    setEditModalVisible(true);
  };

  const handleBoletoSuccess = () => {
    refetch();
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
        <View>
          <Text style={styles.title}>Meus Boletos</Text>
          <Text style={styles.subtitle}>Gerencie seus pagamentos</Text>
        </View>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateFilters}>
          <TouchableOpacity
            style={[
              styles.dateFilterButton,
              areDateRangesEqual(dateRange, getCurrentMonthRange()) && styles.dateFilterButtonActive
            ]}
            onPress={() => setDateRange(getCurrentMonthRange())}
          >
            <Text style={[
              styles.dateFilterButtonText,
              areDateRangesEqual(dateRange, getCurrentMonthRange()) && styles.dateFilterButtonTextActive
            ]}>
              Este Mês
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dateFilterButton,
              areDateRangesEqual(dateRange, getLastMonthRange()) && styles.dateFilterButtonActive
            ]}
            onPress={() => setDateRange(getLastMonthRange())}
          >
            <Text style={[
              styles.dateFilterButtonText,
              areDateRangesEqual(dateRange, getLastMonthRange()) && styles.dateFilterButtonTextActive
            ]}>
              Último Mês
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dateFilterButton,
              areDateRangesEqual(dateRange, getLast3MonthsRange()) && styles.dateFilterButtonActive
            ]}
            onPress={() => setDateRange(getLast3MonthsRange())}
          >
            <Text style={[
              styles.dateFilterButtonText,
              areDateRangesEqual(dateRange, getLast3MonthsRange()) && styles.dateFilterButtonTextActive
            ]}>
              Últimos 3 Meses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dateFilterButton,
              areDateRangesEqual(dateRange, getCurrentBimestreRange()) && styles.dateFilterButtonActive
            ]}
            onPress={() => setDateRange(getCurrentBimestreRange())}
          >
            <Text style={[
              styles.dateFilterButtonText,
              areDateRangesEqual(dateRange, getCurrentBimestreRange()) && styles.dateFilterButtonTextActive
            ]}>
              Bimestre Atual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dateFilterButton,
              !dateRange && styles.dateFilterButtonActive
            ]}
            onPress={() => setDateRange(undefined)}
          >
            <Text style={[
              styles.dateFilterButtonText,
              !dateRange && styles.dateFilterButtonTextActive
            ]}>
              Todos os Períodos
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.filterRow}>
          <StatusDropdown
            selectedStatus={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </View>
        <View style={styles.dateRangeRow}>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </View>
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

      <BoletoModal
        boleto={selectedBoleto}
        isOpen={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedBoleto(null);
        }}
        onSuccess={handleBoletoSuccess}
      />

      <AddBoletoModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onScan={handleScanPress}
        onCreateManual={handleCreateManual}
      />

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
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  filters: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateFilters: {
    marginBottom: 12,
  },
  dateFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  dateFilterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dateFilterButtonText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  dateFilterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  filterRow: {
    marginTop: 8,
  },
  dateRangeRow: {
    marginTop: 8,
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
});
