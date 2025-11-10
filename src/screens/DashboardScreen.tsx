import React, { useState, useRef } from 'react';
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
import { Plus, Filter, Calendar as CalendarIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DateRange, getCurrentMonthRange, getLastMonthRange, getLast3MonthsRange, getCurrentBimestreRange, areDateRangesEqual, toDDMMYYYY, formatDate, getStatusLabel } from '@/lib/utils';
import { Dialog, Button as PaperButton } from 'react-native-paper';
import { commonStyles, colors, spacing, shadows } from '@/styles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

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
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const scrollY = useSharedValue(0);
  const filterProgress = useSharedValue(1); // 1 = expanded, 0 = collapsed
  const lastScrollY = useSharedValue(0);
  const isCollapsedShared = useSharedValue(false);
  const flatListRef = useRef<FlatList>(null);

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

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    lastScrollY.value = offsetY;
    scrollY.value = offsetY;

    // Smooth scroll range - animation happens over 45px of scrolling
    const scrollRange = 45;
    // Calculate progress directly from scroll position (1 = fully expanded, 0 = fully collapsed)
    const rawProgress = Math.max(0, Math.min(1, 1 - (offsetY / scrollRange)));

    // Hysteresis for state changes - prevents jittery behavior
    // Collapse threshold: when scrolled ~25px (progress ~0.44)
    // Expand threshold: when scrolled back to ~10px (progress ~0.78)
    // This makes it collapse earlier and expand earlier for better responsiveness
    const collapseProgressThreshold = 0.44; // Progress below this = collapsed (offsetY > ~25px)
    const expandProgressThreshold = 0.78;   // Progress above this = expanded (offsetY < ~10px)

    const currentlyCollapsed = isCollapsedShared.value;
    let targetCollapsed: boolean;

    if (currentlyCollapsed) {
      // Currently collapsed - expand if we scroll back up enough (progress increases above threshold)
      targetCollapsed = rawProgress < expandProgressThreshold;
    } else {
      // Currently expanded - collapse if we scroll down enough (progress decreases below threshold)
      targetCollapsed = rawProgress < collapseProgressThreshold;
    }

    // Update shared value and JS state for pointer events (only when crossing the threshold)
    if (targetCollapsed !== currentlyCollapsed) {
      isCollapsedShared.value = targetCollapsed;
      runOnJS(setIsFiltersCollapsed)(targetCollapsed);
    }

    // Update progress smoothly - use direct assignment for immediate response, spring for smoothness
    // Use a faster, more responsive spring animation
    filterProgress.value = withSpring(rawProgress, {
      damping: 25,
      stiffness: 250,
      mass: 0.3,
    });
  };

  const getDateRangeDisplayText = (): string => {
    if (!dateRange?.from) return 'Todos os períodos';
    if (dateRange.to) {
      return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
    }
    return formatDate(dateRange.from);
  };

  const getStatusDisplayText = (): string => {
    if (statusFilter === 'ALL') return 'Todos';
    return getStatusLabel(statusFilter);
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

  const expandFilters = () => {
    setIsFiltersCollapsed(false);
    isCollapsedShared.value = false;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    // Very fast spring animation
    filterProgress.value = withSpring(1, {
      damping: 20,
      stiffness: 200,
      mass: 0.3,
    });
  };

  // Animated styles for expanded filters - animate opacity only (height handled by container)
  const expandedFiltersStyle = useAnimatedStyle(() => {
    return {
      opacity: filterProgress.value,
    };
  });

  // Animated styles for collapsed filter bar - fast and synchronized  
  const collapsedBarStyle = useAnimatedStyle(() => {
    const collapsedProgress = 1 - filterProgress.value;
    return {
      opacity: collapsedProgress,
    };
  });

  // Animated style for the filter container - animates height to collapse
  const filterContainerStyle = useAnimatedStyle(() => {
    // When collapsed (filterProgress = 0), height should be just the collapsed bar height
    // When expanded (filterProgress = 1), height should match actual content
    // Collapsed bar height: paddingVertical (12*2) + button minHeight (48) = ~72px
    const collapsedHeight = 72;
    // Expanded height: padding (16*2) + scrollview (~55) + margins (8+8) + status dropdown (~52) + date picker (~52) = ~207px
    const expandedHeight = 180;

    const height = interpolate(
      filterProgress.value,
      [0, 1],
      [collapsedHeight, expandedHeight],
      Extrapolate.CLAMP
    );

    return {
      height,
    };
  });

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

      {/* Filter Container - Collapsed or Expanded */}
      <Animated.View
        style={[
          {
            backgroundColor: colors.background.primary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            overflow: 'hidden',
          },
          filterContainerStyle,
        ]}
      >
        {/* Collapsed Filter Bar - Always mounted for smooth transitions */}
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              alignItems: 'center',
              gap: spacing.sm,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 2,
            },
            collapsedBarStyle,
          ]}
          pointerEvents={isFiltersCollapsed ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              backgroundColor: colors.background.secondary,
              borderRadius: 10,
              gap: spacing.sm,
              flex: 1,
              minHeight: 48,
            }}
            onPress={expandFilters}
            activeOpacity={0.7}
          >
            <Filter size={22} color={colors.primary} />
            <Text style={{ fontSize: spacing.lg, color: colors.text.secondary, fontWeight: '600' }}>
              {getStatusDisplayText()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              backgroundColor: colors.background.secondary,
              borderRadius: 10,
              gap: spacing.sm,
              flex: 1,
              minHeight: 48,
            }}
            onPress={expandFilters}
            activeOpacity={0.7}
          >
            <CalendarIcon size={22} color={colors.primary} />
            <Text
              style={{
                fontSize: spacing.lg,
                color: colors.text.secondary,
                fontWeight: '600',
                flex: 1,
              }}
              numberOfLines={1}
            >
              {getDateRangeDisplayText()}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Expanded Filters - Always mounted for smooth transitions */}
        <Animated.View
          style={[
            expandedFiltersStyle,
            {
              zIndex: 1,
            },
          ]}
          pointerEvents={!isFiltersCollapsed ? 'auto' : 'none'}
        >
          <View style={{ padding: spacing.lg }}>
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
        </Animated.View>
      </Animated.View>

      <FlatList
        ref={flatListRef}
        data={boletos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={commonStyles.empty}>
            <Text style={commonStyles.emptyText}>{t('noBoletos')}</Text>
          </View>
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
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
