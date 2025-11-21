import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView, AppState } from 'react-native';
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
import ScanSourceModal from '@/components/ScanSourceModal';
import ScanModal from '@/components/ScanModal';
import LoadingModal from '@/components/LoadingModal';
import { BoletoCardSkeleton } from '@/components/Skeleton';
import { Plus, Filter, Calendar as CalendarIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { DateRange, getCurrentMonthRange, getLastMonthRange, getLast3MonthsRange, getCurrentBimestreRange, areDateRangesEqual, toDDMMYYYY, formatDate, getStatusLabel } from '@/lib/utils';
import { Dialog, Button as PaperButton } from 'react-native-paper';
import ScreenHeader from '@/components/ScreenHeader';
import { commonStyles, colors, spacing, shadows } from '@/styles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { useClipboardStore } from '@/store/clipboardStore';
import Toast from 'react-native-toast-message';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [statusFilter, setStatusFilter] = useState<BoletoStatus | 'ALL' | string>('PENDENTE,VENCIDO');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getCurrentMonthRange());
  const [selectedBoleto, setSelectedBoleto] = useState<Boleto | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [scanSourceModalVisible, setScanSourceModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [scannedBoleto, setScannedBoleto] = useState<Boleto | null>(null);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [scannedBoletoId, setScannedBoletoId] = useState<number | null>(null);
  const [scanError, setScanError] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const scrollY = useSharedValue(0);
  const filterProgress = useSharedValue(1);
  const lastScrollY = useSharedValue(0);
  const isCollapsedShared = useSharedValue(false);
  const flatListRef = useRef<FlatList>(null);
  const appState = useRef(AppState.currentState);
  const { lastCopiedBoletoId, timestamp } = useClipboardStore();

  const filters = {
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    dataInicio: dateRange?.from ? toDDMMYYYY(dateRange.from) : undefined,
    dataFim: dateRange?.to ? toDDMMYYYY(dateRange.to) : undefined,
    sortBy: 'vencimento',
    direction: 'asc' as const,
    page: 0,
    size: 20,
  };

  const { boletos, isLoading, refetch, markPaid, deleteBoleto, scanBoleto, createBoleto, updateBoleto } = useBoletos(filters);

  const sortedBoletos = React.useMemo(() => {
    if (!boletos) return [];
    if (!lastCopiedBoletoId) return boletos;

    const index = boletos.findIndex(b => b.id === lastCopiedBoletoId);
    if (index === -1) return boletos;

    const newBoletos = [...boletos];
    const [item] = newBoletos.splice(index, 1);
    newBoletos.unshift(item);
    return newBoletos;
  }, [boletos, lastCopiedBoletoId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkLastCopiedBoleto();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [lastCopiedBoletoId, boletos]);

  const checkLastCopiedBoleto = () => {
    if (lastCopiedBoletoId && boletos) {
      const boleto = boletos.find(b => b.id === lastCopiedBoletoId);
      // Check if copied recently (e.g., within last 15 minutes)
      const isRecent = timestamp && (Date.now() - timestamp < 15 * 60 * 1000);

      if (boleto && boleto.status === 'PENDENTE' && isRecent) {
        Toast.show({
          type: 'info',
          text1: 'Pagou o boleto?',
          text2: `Toque para anexar o comprovante de ${boleto.fornecedor}`,
          onPress: () => {
            handleMarkPaid(boleto);
          },
          visibilityTime: 6000,
        });
      }
    }
  };

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
    setScanSourceModalVisible(true);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleScan(result.assets[0].uri);
    }
  };

  const handleUploadImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        handleScan(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleScan = (imageUri: string) => {
    setScannedImageUri(imageUri);
    setScanError(false);
    setIsProcessingImage(true);

    scanBoleto(imageUri, {
      onSuccess: (data) => {
        setScannedBoleto(data);
        setScannedBoletoId(data.id);
        setIsProcessingImage(false);
        setScanModalVisible(true);
        setScanError(false);
      },
      onError: () => {
        setScannedBoleto(null);
        setScannedBoletoId(null);
        setIsProcessingImage(false);
        setScanModalVisible(true);
        setScanError(true);
      },
    });
  };

  const handleRetryScan = () => {
    if (scannedImageUri) {
      setScanModalVisible(false);
      setIsProcessingImage(true);
      handleScan(scannedImageUri);
    }
  };

  const handleScanModalClose = () => {
    if (scannedBoletoId) {
      deleteBoleto(scannedBoletoId);
    }
    setScanModalVisible(false);
    setScannedBoleto(null);
    setScannedImageUri(null);
    setScannedBoletoId(null);
    setScanError(false);
  };

  const handleScanModalSubmit = (data: any) => {
    const valor = parseFloat(data.valor.replace(',', '.'));

    if (scannedBoleto && scannedBoletoId) {
      const scannedVencimentoFormatted = formatDate(scannedBoleto.vencimento);
      const hasChanges =
        scannedBoleto.fornecedor !== data.fornecedor ||
        Math.abs(scannedBoleto.valor - valor) > 0.01 ||
        scannedVencimentoFormatted !== data.vencimento ||
        (scannedBoleto.codigoBarras || '') !== (data.codigoBarras || '') ||
        (scannedBoleto.categoria?.id || null) !== (data.categoriaId || null);

      if (hasChanges && updateBoleto) {
        updateBoleto(
          {
            id: scannedBoletoId,
            data: {
              fornecedor: data.fornecedor,
              valor,
              vencimento: data.vencimento,
              codigoBarras: data.codigoBarras || undefined,
              categoriaId: data.categoriaId || null,
            },
          },
          {
            onSuccess: () => {
              setScanModalVisible(false);
              setScannedBoleto(null);
              setScannedImageUri(null);
              setScannedBoletoId(null);
              setScanError(false);
              refetch();
            },
          }
        );
      } else {
        setScanModalVisible(false);
        setScannedBoleto(null);
        setScannedImageUri(null);
        setScannedBoletoId(null);
        setScanError(false);
        refetch();
      }
      return;
    }

    createBoleto(
      {
        fornecedor: data.fornecedor,
        valor,
        vencimento: data.vencimento,
        codigoBarras: data.codigoBarras || undefined,
        categoriaId: data.categoriaId || null,
      },
      {
        onSuccess: () => {
          setScanModalVisible(false);
          setScannedBoleto(null);
          setScannedImageUri(null);
          setScannedBoletoId(null);
          setScanError(false);
          refetch();
        },
      }
    );
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

    const scrollRange = 45;
    const rawProgress = Math.max(0, Math.min(1, 1 - (offsetY / scrollRange)));

    const collapseProgressThreshold = 0.44;
    const expandProgressThreshold = 0.78;

    const currentlyCollapsed = isCollapsedShared.value;
    let targetCollapsed: boolean;

    if (currentlyCollapsed) {
      targetCollapsed = rawProgress < expandProgressThreshold;
    } else {
      targetCollapsed = rawProgress < collapseProgressThreshold;
    }

    if (targetCollapsed !== currentlyCollapsed) {
      isCollapsedShared.value = targetCollapsed;
      runOnJS(setIsFiltersCollapsed)(targetCollapsed);
    }

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
    if (statusFilter === 'PENDENTE,VENCIDO') return 'Pendente e Vencido';
    return getStatusLabel(statusFilter as BoletoStatus);
  };

  const handleMarkPaidWithComprovante = (boletoId: number, comprovanteUri: string) => {
    markPaid(
      { id: boletoId, comprovanteUri },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const renderItem = ({ item }: { item: Boleto }) => (
    <BoletoCard
      boleto={item}
      onPress={() => handleEdit(item)}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item)}
      onMarkPaid={() => handleMarkPaid(item)}
      onMarkPaidWithComprovante={handleMarkPaidWithComprovante}
      isLastCopied={item.id === lastCopiedBoletoId}
    />
  );

  const expandFilters = () => {
    setIsFiltersCollapsed(false);
    isCollapsedShared.value = false;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    filterProgress.value = withSpring(1, {
      damping: 20,
      stiffness: 200,
      mass: 0.3,
    });
  };

  const expandedFiltersStyle = useAnimatedStyle(() => {
    return {
      opacity: filterProgress.value,
    };
  });

  const collapsedBarStyle = useAnimatedStyle(() => {
    const collapsedProgress = 1 - filterProgress.value;
    return {
      opacity: collapsedProgress,
    };
  });

  const filterContainerStyle = useAnimatedStyle(() => {
    const collapsedHeight = 72;
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
    <SafeAreaView style={[commonStyles.screenContainer, { backgroundColor: '#FFFFFF' }]} edges={['top']}>
      <ScreenHeader
        title="Meus Boletos"
        subtitle="Gerencie seus pagamentos"
        rightAction={{
          icon: <Plus size={24} color={colors.text.white} />,
          onPress: () => setAddModalVisible(true),
        }}
      />

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

      {isLoading && !boletos.length ? (
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
          }}
        >
          <BoletoCardSkeleton count={5} />
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={sortedBoletos}
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
      )}

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

      <ScanSourceModal
        visible={scanSourceModalVisible}
        onClose={() => setScanSourceModalVisible(false)}
        onTakePhoto={handleTakePhoto}
        onUploadImage={handleUploadImage}
      />

      <ScanModal
        visible={scanModalVisible}
        scannedBoleto={scannedBoleto}
        scannedImageUri={scannedImageUri}
        scanError={scanError}
        onClose={handleScanModalClose}
        onSubmit={handleScanModalSubmit}
        onRetry={handleRetryScan}
      />

      <LoadingModal
        visible={isProcessingImage}
        message="Processando imagem..."
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