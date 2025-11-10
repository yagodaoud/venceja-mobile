import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { Boleto } from '@/types';
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
  isBoletoExpiringSoon,
  calculateStatus,
} from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Swipeable } from 'react-native-gesture-handler';
import { Edit, Trash2, Clock, Circle, X, Calendar, FileText } from 'lucide-react-native';
import ComprovantePreview from './ComprovantePreview';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, shadows, borderRadius } from '@/styles';

interface BoletoCardProps {
  boleto: Boleto;
  onPress?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid: () => void;
  onExpand?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function BoletoCard({
  boleto,
  onPress,
  onEdit,
  onDelete,
  onMarkPaid,
  onExpand,
}: BoletoCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [showComprovantePreview, setShowComprovantePreview] = useState(false);
  const status = calculateStatus(boleto);
  const statusColor = getStatusColor(status);
  const isExpiringSoon = status === 'PENDENTE' && isBoletoExpiringSoon(boleto.vencimento);
  const isUrgent = isExpiringSoon; // Less than 3 days
  const wiggle = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(300);

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Open edit modal directly when card is clicked
    onEdit();
  };

  const handleCloseModal = () => {
    modalOpacity.value = withTiming(0, { duration: 200 });
    modalTranslateY.value = withTiming(300, { duration: 200 }, () => {
      setExpanded(false);
    });
  };

  React.useEffect(() => {
    if (isUrgent) {
      // Wiggle animation for urgent items
      wiggle.value = withSequence(
        withTiming(-5, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 150, easing: Easing.inOut(Easing.ease) })
      );
    }
  }, [isUrgent]);

  const wiggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: wiggle.value }],
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const renderRightActions = () => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onEdit();
          }}
        >
          <Edit color={colors.text.white} size={20} />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete();
          }}
        >
          <Trash2 color={colors.text.white} size={20} />
          <Text style={styles.actionText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getStatusIcon = () => {
    const iconColor = statusColor === colors.primary ? colors.primary : statusColor === colors.error ? colors.error : colors.warning;
    return <Circle size={0} color={iconColor} fill={iconColor} />;
  };

  return (
    <>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          style={styles.card}
          onPress={handleCardPress}
          activeOpacity={0.7}
        >
          {/* Top Row: Fornecedor and Status */}
          <View style={styles.topRow}>
            <Text style={styles.fornecedorText}>{boleto.fornecedor}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              {getStatusIcon()}
              <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
            </View>
          </View>

          {/* Hero: Valor */}
          <Text style={styles.valor}>
            {formatCurrency(boleto.valor)}
          </Text>

          {/* Vencimento with urgency indicator */}
          <Animated.View style={[styles.vencimentoContainer, wiggleStyle]}>
            {isUrgent && <Clock size={14} color={colors.status.warning} style={styles.clockIcon} />}
            <Text
              style={[
                styles.vencimento,
                isUrgent && styles.vencimentoUrgent,
              ]}
            >
              {formatDate(boleto.vencimento)}
            </Text>
          </Animated.View>

          {/* Action Button - Pay or View Receipt */}
          {status === 'PAGO' && boleto.comprovanteUrl ? (
            <TouchableOpacity
              style={styles.receiptButton}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowComprovantePreview(true);
              }}
            >
              <FileText size={16} color={colors.text.white} style={{ marginRight: 4 }} />
              <Text style={styles.receiptButtonText}>Ver Comprovante</Text>
            </TouchableOpacity>
          ) : (status === 'PENDENTE' || status === 'VENCIDO') ? (
            <TouchableOpacity
              style={styles.payButton}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onMarkPaid();
              }}
            >
              <Text style={styles.payButtonText}>Pagar</Text>
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </Swipeable>

      {/* Expandable Modal/Bottom Sheet */}
      <Modal
        visible={expanded}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <Animated.View style={[styles.modalContent, modalAnimatedStyle]}>
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{boleto.fornecedor}</Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Status Badge */}
              <View style={styles.modalStatusContainer}>
                <View style={[styles.modalStatusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.modalStatusText}>{getStatusLabel(status)}</Text>
                </View>
              </View>

              {/* Valor */}
              <View style={styles.modalValorContainer}>
                <Text style={styles.modalValor}>{formatCurrency(boleto.valor)}</Text>
              </View>

              {/* Details Grid */}
              <View style={styles.modalDetails}>
                <View style={styles.modalDetailRow}>
                  <Calendar size={20} color={colors.text.light} />
                  <View style={styles.modalDetailText}>
                    <Text style={styles.modalDetailLabel}>Vencimento</Text>
                    <Text style={styles.modalDetailValue}>
                      {formatDate(boleto.vencimento)}
                    </Text>
                  </View>
                </View>

                {boleto.categoria && (
                  <View style={styles.modalDetailRow}>
                    <View
                      style={[
                        styles.modalCategorySwatch,
                        { backgroundColor: boleto.categoria.cor },
                      ]}
                    />
                    <View style={styles.modalDetailText}>
                      <Text style={styles.modalDetailLabel}>Categoria</Text>
                      <Text style={styles.modalDetailValue}>
                        {boleto.categoria.nome}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Imagem */}
              {boleto.imagemUrl && (
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: boleto.imagemUrl }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Comprovante */}
              {boleto.comprovanteUrl && (
                <View style={styles.modalComprovanteContainer}>
                  <Text style={styles.modalComprovanteLabel}>Comprovante</Text>
                  <Image
                    source={{ uri: boleto.comprovanteUrl }}
                    style={styles.modalComprovanteImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {boleto.semComprovante && status === 'PAGO' && (
                <View style={styles.modalNoReceipt}>
                  <Text style={styles.modalNoReceiptText}>
                    Pago sem comprovante
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                {(status === 'PENDENTE' || status === 'VENCIDO') && (
                  <TouchableOpacity
                    style={styles.modalPayButton}
                    onPress={() => {
                      handleCloseModal();
                      onMarkPaid();
                    }}
                  >
                    <Text style={styles.modalPayButtonText}>Marcar como Pago</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.modalEditButton}
                  onPress={() => {
                    handleCloseModal();
                    onEdit();
                  }}
                >
                  <Edit size={20} color={colors.secondary} />
                  <Text style={styles.modalEditButtonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <ComprovantePreview
        visible={showComprovantePreview}
        imageUri={boleto.comprovanteUrl || ''}
        onClose={() => setShowComprovantePreview(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    ...shadows.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fornecedorText: {
    fontSize: spacing.xl,
    fontWeight: '600',
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.lg,
    gap: 1,
    minHeight: 28,
  },
  statusText: {
    color: colors.text.white,
    fontSize: spacing.md,
    fontWeight: '600',
    lineHeight: spacing.md,
  },
  valor: {
    fontSize: spacing.xxxl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  vencimentoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  clockIcon: {
    marginRight: spacing.xs,
  },
  vencimento: {
    fontSize: spacing.md,
    color: colors.text.light,
    fontStyle: 'italic',
    textAlign: 'center',
    minWidth: 100,
  },
  vencimentoUrgent: {
    color: colors.status.warning,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  payButtonText: {
    color: colors.text.white,
    fontSize: spacing.lg,
    fontWeight: '600',
  },
  receiptButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  receiptButtonText: {
    color: colors.text.white,
    fontSize: spacing.lg,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: spacing.lg,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    width: 80,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  editButton: {
    backgroundColor: colors.secondary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionText: {
    color: colors.text.white,
    fontSize: spacing.sm,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.overlay,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '70%',
    paddingBottom: spacing.xxxxl,
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: spacing.xxl,
    fontWeight: '700',
    color: colors.text.secondary,
    flex: 1,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalStatusContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.lg,
  },
  modalStatusText: {
    color: colors.text.white,
    fontSize: spacing.sm,
    fontWeight: '600',
  },
  modalValorContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  modalValor: {
    fontSize: spacing.xxxxl,
    fontWeight: '700',
    color: colors.primary,
  },
  modalDetails: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalCategorySwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  modalDetailText: {
    flex: 1,
  },
  modalDetailLabel: {
    fontSize: spacing.sm,
    color: colors.text.light,
    marginBottom: spacing.xs,
  },
  modalDetailValue: {
    fontSize: spacing.lg,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  modalImageContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.tertiary,
  },
  modalComprovanteContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  modalComprovanteLabel: {
    fontSize: spacing.md,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  modalComprovanteImage: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.tertiary,
  },
  modalNoReceipt: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  modalNoReceiptText: {
    fontSize: spacing.md,
    color: colors.text.light,
    fontStyle: 'italic',
  },
  modalActions: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  modalPayButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalPayButtonText: {
    color: colors.text.white,
    fontSize: spacing.lg,
    fontWeight: '600',
  },
  modalEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.secondary,
    gap: spacing.sm,
  },
  modalEditButtonText: {
    color: colors.secondary,
    fontSize: spacing.lg,
    fontWeight: '600',
  },
});
