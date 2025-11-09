import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBoletos } from '@/hooks/useBoletos';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getDateRange } from '@/lib/utils';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Share } from 'react-native-share';
import { Calendar, Download } from 'lucide-react-native';
import { BoletoStatus } from '@/types';
import { calculateStatus } from '@/lib/utils';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<'este-mes' | 'ultimos-3-meses' | 'este-ano'>('este-mes');
  const range = getDateRange(dateRange);

  const { boletos } = useBoletos({
    dataInicio: range.inicio,
    dataFim: range.fim,
    size: 1000,
  });

  const totalPago = boletos
    .filter((b) => calculateStatus(b) === 'PAGO')
    .reduce((sum, b) => sum + b.valor, 0);

  const totalPendente = boletos
    .filter((b) => calculateStatus(b) === 'PENDENTE')
    .reduce((sum, b) => sum + b.valor, 0);

  const totalVencido = boletos
    .filter((b) => calculateStatus(b) === 'VENCIDO')
    .reduce((sum, b) => sum + b.valor, 0);

  // Category data for pie chart (top 5)
  const categoryMap = new Map<string, number>();
  boletos.forEach((b) => {
    if (b.categoria) {
      const current = categoryMap.get(b.categoria.nome) || 0;
      categoryMap.set(b.categoria.nome, current + b.valor);
    }
  });

  const categoryData = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], index) => ({
      name,
      value,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      legendFontColor: '#757575',
      legendFontSize: 12,
    }));

  const handleExportCSV = async () => {
    const headers = ['Fornecedor', 'Valor', 'Vencimento', 'Status', 'Categoria'];
    const rows = boletos.map((b) => [
      b.fornecedor,
      b.valor.toString(),
      b.vencimento,
      calculateStatus(b),
      b.categoria?.nome || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    try {
      await Share.open({
        title: 'Exportar CSV',
        message: csv,
        type: 'text/csv',
      });
    } catch (error) {
      // User cancelled
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('reports')}</Text>
        <TouchableOpacity onPress={handleExportCSV}>
          <Download size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dateRangeContainer}>
          <Calendar size={20} color="#4CAF50" />
          <Text style={styles.dateRangeLabel}>{t('dateRange')}</Text>
        </View>
        <View style={styles.dateRangeButtons}>
          <TouchableOpacity
            style={[styles.dateRangeButton, dateRange === 'este-mes' && styles.dateRangeButtonActive]}
            onPress={() => setDateRange('este-mes')}
          >
            <Text style={[styles.dateRangeButtonText, dateRange === 'este-mes' && styles.dateRangeButtonTextActive]}>
              {t('thisMonth')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateRangeButton, dateRange === 'ultimos-3-meses' && styles.dateRangeButtonActive]}
            onPress={() => setDateRange('ultimos-3-meses')}
          >
            <Text style={[styles.dateRangeButtonText, dateRange === 'ultimos-3-meses' && styles.dateRangeButtonTextActive]}>
              {t('last3Months')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateRangeButton, dateRange === 'este-ano' && styles.dateRangeButtonActive]}
            onPress={() => setDateRange('este-ano')}
          >
            <Text style={[styles.dateRangeButtonText, dateRange === 'este-ano' && styles.dateRangeButtonTextActive]}>
              {t('thisYear')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{t('totalPaid')}</Text>
            <Text style={[styles.totalValue, { color: '#4CAF50' }]}>
              {formatCurrency(totalPago)}
            </Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{t('totalPending')}</Text>
            <Text style={[styles.totalValue, { color: '#FF9800' }]}>
              {formatCurrency(totalPendente)}
            </Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{t('totalExpired')}</Text>
            <Text style={[styles.totalValue, { color: '#F44336' }]}>
              {formatCurrency(totalVencido)}
            </Text>
          </View>
        </View>

        {categoryData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{t('byCategory')}</Text>
            <PieChart
              data={categoryData}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateRangeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  dateRangeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  dateRangeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dateRangeButtonText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  dateRangeButtonTextActive: {
    color: '#fff',
  },
  totals: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  totalCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
});

