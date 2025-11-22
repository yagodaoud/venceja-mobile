// src/screens/DashboardScreen.tsx (Refatorado)
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, RefreshControl, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { Dialog, Button as PaperButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Animated, { useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useBoletos } from '@/hooks/useBoletos';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { useBoletoScanner } from '@/hooks/useBoletoScanner';
import { useClipboardStore } from '@/store/clipboardStore';
import { useShareIntentHandler } from '@/hooks/useShareIntentHandler';

import BoletoCard from '@/components/BoletoCard';
import PaymentModal from '@/components/PaymentModal';
import BoletoModal from '@/components/BoletoModal';
import AddBoletoModal from '@/components/AddBoletoModal';
import ScanSourceModal from '@/components/ScanSourceModal';
import ScanModal from '@/components/ScanModal';
import LoadingModal from '@/components/LoadingModal';
import ScreenHeader from '@/components/ScreenHeader';
import CollapsibleFilters from '@/components/CollapsibleFilters';
import { BoletoCardSkeleton } from '@/components/Skeleton';

import { Boleto } from '@/types';
import { commonStyles, colors, spacing } from '@/styles';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const [selectedBoleto, setSelectedBoleto] = useState<Boleto | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const appState = useRef(AppState.currentState);
  const scrollY = useSharedValue(0);
  const filterProgress = useSharedValue(1);
  const lastScrollY = useSharedValue(0);
  const isCollapsedShared = useSharedValue(false);

  const { lastCopiedBoletoId, timestamp } = useClipboardStore();
  const { statusFilter, setStatusFilter, dateRange, setDateRange, filters } = useDashboardFilters();
  const { boletos, isLoading, refetch, markPaid, deleteBoleto, scanBoleto, createBoleto, updateBoleto } = useBoletos(filters);
  const scanner = useBoletoScanner();

  // Sorted boletos with last copied at top
  const sortedBoletos = React.useMemo(() => {
    if (!boletos || !lastCopiedBoletoId) return boletos || [];
    const index = boletos.findIndex(b => b.id === lastCopiedBoletoId);
    if (index === -1) return boletos;
    const newBoletos = [...boletos];
    const [item] = newBoletos.splice(index, 1);
    newBoletos.unshift(item);
    return newBoletos;
  }, [boletos, lastCopiedBoletoId]);

  const { sharedFileUri, clearSharedFile } = useShareIntentHandler({
    lastCopiedBoletoId,
    boletos,
    onShareReceived: (boleto, fileUri) => {
      setSelectedBoleto(boleto);
      setPaymentModalVisible(true);
    },
  });

  // Check for last copied boleto on app resume
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkLastCopiedBoleto();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [lastCopiedBoletoId, boletos]);

  const checkLastCopiedBoleto = () => {
    if (!lastCopiedBoletoId || !boletos) return;
    const boleto = boletos.find(b => b.id === lastCopiedBoletoId);
    const isRecent = timestamp && (Date.now() - timestamp < 15 * 60 * 1000);

    if (boleto && boleto.status === 'PENDENTE' && isRecent) {
      Toast.show({
        type: 'info',
        text1: 'Pagou o boleto?',
        text2: `Toque para anexar o comprovante de ${boleto.fornecedor}`,
        onPress: () => handleMarkPaid(boleto),
        visibilityTime: 6000,
      });
    }
  };

  // Action handlers
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

  const handleMarkPaidWithComprovante = (boletoId: number, comprovanteUri: string) => {
    markPaid({ id: boletoId, comprovanteUri }, { onSuccess: () => refetch() });
  };

  // Scanner handlers
  const handleScanPress = () => {
    scanner.setScanSourceModalVisible(true);
  };

  const handleTakePhoto = async () => {
    const imageUri = await scanner.handleTakePhoto();
    if (imageUri) {
      scanner.handleScan(imageUri, scanBoleto);
      setScanModalVisible(true);
    }
  };

  const handleUploadImage = async () => {
    const imageUri = await scanner.handleUploadImage();
    if (imageUri) {
      scanner.handleScan(imageUri, scanBoleto);
      setScanModalVisible(true);
    }
  };

  // Scroll handling for collapsible filters
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    lastScrollY.value = offsetY;
    scrollY.value = offsetY;

    const scrollRange = 45;
    const rawProgress = Math.max(0, Math.min(1, 1 - (offsetY / scrollRange)));
    const collapseThreshold = 0.44;
    const expandThreshold = 0.78;

    const currentlyCollapsed = isCollapsedShared.value;
    const targetCollapsed = currentlyCollapsed
      ? rawProgress < expandThreshold
      : rawProgress < collapseThreshold;

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

  const expandFilters = () => {
    setIsFiltersCollapsed(false);
    isCollapsedShared.value = false;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    filterProgress.value = withSpring(1, { damping: 20, stiffness: 200, mass: 0.3 });
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

      <CollapsibleFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isFiltersCollapsed={isFiltersCollapsed}
        filterProgress={filterProgress}
        onExpandFilters={expandFilters}
      />

      {isLoading && !boletos.length ? (
        <ScrollView contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.sm }}>
          <BoletoCardSkeleton count={5} />
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={sortedBoletos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.sm }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
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

      {/* Modals */}
      <PaymentModal
        visible={paymentModalVisible}
        boleto={selectedBoleto}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedBoleto(null);
          clearSharedFile();
        }}
        initialComprovanteUri={sharedFileUri}
      />

      <BoletoModal
        boleto={selectedBoleto}
        isOpen={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedBoleto(null);
        }}
        onSuccess={() => refetch()}
      />

      <AddBoletoModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onScan={handleScanPress}
        onCreateManual={() => {
          setSelectedBoleto(null);
          setEditModalVisible(true);
        }}
      />

      <ScanSourceModal
        visible={scanner.scanSourceModalVisible}
        onClose={() => scanner.setScanSourceModalVisible(false)}
        onTakePhoto={() => {
          scanner.setScanSourceModalVisible(false);
          handleTakePhoto();
        }}
        onUploadImage={() => {
          scanner.setScanSourceModalVisible(false);
          handleUploadImage();
        }}
      />

      <ScanModal
        visible={scanModalVisible}
        scannedBoleto={scanner.scannedBoleto}
        scannedImageUri={scanner.scannedImageUri}
        scanError={scanner.scanError}
        onClose={() => {
          scanner.handleScanModalClose(deleteBoleto);
          setScanModalVisible(false);
        }}
        onSubmit={(data) => scanner.handleScanModalSubmit(
          data,
          updateBoleto,
          createBoleto,
          refetch,
          () => setScanModalVisible(false)
        )}
        onRetry={() => scanner.handleRetryScan(scanBoleto)}
      />

      <LoadingModal visible={scanner.isProcessingImage} message="Processando imagem..." />

      <Dialog visible={deleteModalVisible} onDismiss={() => setDeleteModalVisible(false)}>
        <Dialog.Title>{t('confirmDelete')}</Dialog.Title>
        <Dialog.Content>
          <Text style={{ fontSize: spacing.lg, color: colors.text.tertiary, marginBottom: spacing.lg }}>
            Tem certeza que deseja excluir este boleto?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <PaperButton onPress={() => setDeleteModalVisible(false)}>{t('cancel')}</PaperButton>
          <PaperButton onPress={confirmDelete} textColor={colors.error}>{t('delete')}</PaperButton>
        </Dialog.Actions>
      </Dialog>
    </SafeAreaView>
  );
}