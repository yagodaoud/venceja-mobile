import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
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
import { commonStyles, colors, spacing, shadows } from '@/styles';

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
    <SafeAreaView style={commonStyles.screenContainer} edges={['top']}>
      <View style={commonStyles.screenHeader}>
        <View>
          <Text style={[commonStyles.screenTitle, { marginBottom: spacing.xs }]}>Meus Boletos</Text>
          <Text style={commonStyles.screenSubtitle}>Gerencie seus pagamentos</Text>
        </View>
        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            ...shadows.md,
          }}
          onPress={() => setAddModalVisible(true)}
        >
          <Plus size={24} color={colors.text.white} />
        </TouchableOpacity>
      </View>

      <View style={{ padding: spacing.lg, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          <TouchableOpacity
            style={[
              commonStyles.filterButton,
              areDateRangesEqual(dateRange, getCurrentMonthRange()) && commonStyles.filterButtonActive
            ]}
            onPress={() => setDateRange(getCurrentMonthRange())}
          >
            <Text style={[
              commonStyles.filterButtonText,
              areDateRangesEqual(dateRange, getCurrentMonthRange()) && commonStyles.filterButtonTextActive
            ]}>
              Este Mês
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.filterButton,
              areDateRangesEqual(dateRange, getLastMonthRange()) && commonStyles.filterButtonActive
            ]}
            onPress={() => setDateRange(getLastMonthRange())}
          >
            <Text style={[
              commonStyles.filterButtonText,
              areDateRangesEqual(dateRange, getLastMonthRange()) && commonStyles.filterButtonTextActive
            ]}>
              Último Mês
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.filterButton,
              areDateRangesEqual(dateRange, getLast3MonthsRange()) && commonStyles.filterButtonActive
            ]}
            onPress={() => setDateRange(getLast3MonthsRange())}
          >
            <Text style={[
              commonStyles.filterButtonText,
              areDateRangesEqual(dateRange, getLast3MonthsRange()) && commonStyles.filterButtonTextActive
            ]}>
              Últimos 3 Meses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.filterButton,
              areDateRangesEqual(dateRange, getCurrentBimestreRange()) && commonStyles.filterButtonActive
            ]}
            onPress={() => setDateRange(getCurrentBimestreRange())}
          >
            <Text style={[
              commonStyles.filterButtonText,
              areDateRangesEqual(dateRange, getCurrentBimestreRange()) && commonStyles.filterButtonTextActive
            ]}>
              Bimestre Atual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.filterButton,
              !dateRange && commonStyles.filterButtonActive
            ]}
            onPress={() => setDateRange(undefined)}
          >
            <Text style={[
              commonStyles.filterButtonText,
              !dateRange && commonStyles.filterButtonTextActive
            ]}>
              Todos os Períodos
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={{ marginTop: spacing.sm }}>
          <StatusDropdown
            selectedStatus={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </View>
        <View style={{ marginTop: spacing.sm }}>
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
        contentContainerStyle={commonStyles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={commonStyles.empty}>
            <Text style={commonStyles.emptyText}>{t('noBoletos')}</Text>
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
          <Text style={{ fontSize: spacing.lg, color: colors.text.tertiary, marginBottom: spacing.lg }}>
            Tem certeza que deseja excluir este boleto?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <PaperButton onPress={() => setDeleteModalVisible(false)}>{t('cancel')}</PaperButton>
          <PaperButton onPress={confirmDelete} textColor={colors.error}>
            {t('delete')}
          </PaperButton>
        </Dialog.Actions>
      </Dialog>
    </SafeAreaView>
  );
}
