import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Boleto } from '@/types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, isBoletoExpiringSoon, calculateStatus } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Swipeable } from 'react-native-gesture-handler';
import { Edit, Trash2, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface BoletoCardProps {
  boleto: Boleto;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid: () => void;
}

export default function BoletoCard({ boleto, onPress, onEdit, onDelete, onMarkPaid }: BoletoCardProps) {
  const { t } = useTranslation();
  const status = calculateStatus(boleto);
  const statusColor = getStatusColor(status);
  const isExpiringSoon = status === 'PENDENTE' && isBoletoExpiringSoon(boleto.vencimento);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

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
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete();
          }}
        >
          <Trash2 color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
        {isExpiringSoon && (
          <View style={styles.alertBanner}>
            <AlertCircle size={16} color="#FF9800" />
            <Text style={styles.alertText}>{t('expiringIn3Days')}</Text>
          </View>
        )}
        
        <View style={styles.header}>
          <Text style={styles.fornecedor} numberOfLines={1}>
            {boleto.fornecedor}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.valor}>{formatCurrency(boleto.valor)}</Text>
          <Text style={styles.vencimento}>
            {t('dueDate')}: {formatDate(boleto.vencimento)}
          </Text>
          
          {boleto.categoria && (
            <View style={styles.categoriaContainer}>
              <View style={[styles.categoriaDot, { backgroundColor: boleto.categoria.cor }]} />
              <Text style={styles.categoriaText}>{boleto.categoria.nome}</Text>
            </View>
          )}

          {boleto.comprovanteUrl && (
            <View style={styles.comprovanteContainer}>
              <Image source={{ uri: boleto.comprovanteUrl }} style={styles.comprovanteThumb} />
              <Text style={styles.comprovanteText}>{t('receipt')}</Text>
            </View>
          )}

          {boleto.semComprovante && status === 'PAGO' && (
            <Text style={styles.noReceiptText}>{t('noReceipt')}</Text>
          )}
        </View>

        {status !== 'PAGO' && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onMarkPaid();
            }}
          >
            <Text style={styles.payButtonText}>{t('markAsPaid')}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    gap: 6,
  },
  alertText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fornecedor: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    marginBottom: 12,
  },
  valor: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  vencimento: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  categoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  categoriaDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoriaText: {
    fontSize: 14,
    color: '#757575',
  },
  comprovanteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  comprovanteThumb: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  comprovanteText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  noReceiptText: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
    marginTop: 4,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 16,
    gap: 8,
  },
  actionButton: {
    width: 60,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
});

