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
          <Edit color="#fff" size={20} />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete();
          }}
        >
          <Trash2 color="#fff" size={20} />
          <Text style={styles.actionText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getStatusIcon = () => {
    const iconColor = statusColor === '#4CAF50' ? '#4CAF50' : statusColor === '#F44336' ? '#F44336' : '#FF9800';
    return <Circle size={8} color={iconColor} fill={iconColor} />;
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
            {isUrgent && <Clock size={14} color="#FFC107" style={styles.clockIcon} />}
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
              <FileText size={16} color="#fff" style={{ marginRight: 4 }} />
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
                  <X size={24} color="#111827" />
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
                  <Calendar size={20} color="#6B7280" />
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
                  <Edit size={20} color="#2196F3" />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fornecedorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  valor: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 8,
  },
  vencimentoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  clockIcon: {
    marginRight: 4,
  },
  vencimento: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    minWidth: 100,
  },
  vencimentoUrgent: {
    color: '#FFC107',
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  receiptButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  receiptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 16,
    marginVertical: 8,
    gap: 8,
  },
  actionButton: {
    width: 80,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalStatusContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalValorContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalValor: {
    fontSize: 32,
    fontWeight: '700',
    color: '#16A34A',
  },
  modalDetails: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalCategorySwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  modalDetailText: {
    flex: 1,
  },
  modalDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalDetailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  modalImageContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  modalComprovanteContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalComprovanteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  modalComprovanteImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  modalNoReceipt: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalNoReceiptText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  modalPayButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalPayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    gap: 8,
  },
  modalEditButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
});
