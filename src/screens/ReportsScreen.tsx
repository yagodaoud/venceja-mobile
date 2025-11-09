import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBoletos } from '@/hooks/useBoletos';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getDateRange } from '@/lib/utils';
import { PieChart } from 'react-native-chart-kit';
import { Calendar, Download } from 'lucide-react-native';
import { BoletoStatus } from '@/types';
import { calculateStatus } from '@/lib/utils';
import { commonStyles, colors, spacing, shadows } from '@/styles';

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
      await Share.share({
        message: csv,
        title: 'Exportar CSV',
      });
    } catch (error) {
      // User cancelled or error occurred
    }
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={['top']}>
      <View style={commonStyles.screenHeader}>
        <Text style={commonStyles.screenTitle}>{t('reports')}</Text>
        <TouchableOpacity onPress={handleExportCSV}>
          <Download size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={commonStyles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
          <Calendar size={20} color={colors.primary} />
          <Text style={{ fontSize: spacing.lg, fontWeight: '600', color: colors.text.primary }}>
            {t('dateRange')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxl }}>
          <TouchableOpacity
            style={[
              { flex: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: spacing.sm, backgroundColor: colors.background.primary, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
              dateRange === 'este-mes' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setDateRange('este-mes')}
          >
            <Text style={[
              { fontSize: spacing.md, color: colors.text.tertiary, fontWeight: '600' },
              dateRange === 'este-mes' && { color: colors.text.white }
            ]}>
              {t('thisMonth')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              { flex: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: spacing.sm, backgroundColor: colors.background.primary, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
              dateRange === 'ultimos-3-meses' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setDateRange('ultimos-3-meses')}
          >
            <Text style={[
              { fontSize: spacing.md, color: colors.text.tertiary, fontWeight: '600' },
              dateRange === 'ultimos-3-meses' && { color: colors.text.white }
            ]}>
              {t('last3Months')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              { flex: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: spacing.sm, backgroundColor: colors.background.primary, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
              dateRange === 'este-ano' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setDateRange('este-ano')}
          >
            <Text style={[
              { fontSize: spacing.md, color: colors.text.tertiary, fontWeight: '600' },
              dateRange === 'este-ano' && { color: colors.text.white }
            ]}>
              {t('thisYear')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxl }}>
          <View style={[commonStyles.card, { marginHorizontal: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: spacing.sm, color: colors.text.tertiary, marginBottom: spacing.sm }}>
              {t('totalPaid')}
            </Text>
            <Text style={{ fontSize: spacing.xl, fontWeight: '700', color: colors.status.pago }}>
              {formatCurrency(totalPago)}
            </Text>
          </View>
          <View style={[commonStyles.card, { marginHorizontal: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: spacing.sm, color: colors.text.tertiary, marginBottom: spacing.sm }}>
              {t('totalPending')}
            </Text>
            <Text style={{ fontSize: spacing.xl, fontWeight: '700', color: colors.status.pendente }}>
              {formatCurrency(totalPendente)}
            </Text>
          </View>
          <View style={[commonStyles.card, { marginHorizontal: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: spacing.sm, color: colors.text.tertiary, marginBottom: spacing.sm }}>
              {t('totalExpired')}
            </Text>
            <Text style={{ fontSize: spacing.xl, fontWeight: '700', color: colors.status.vencido }}>
              {formatCurrency(totalVencido)}
            </Text>
          </View>
        </View>

        {categoryData.length > 0 && (
          <View style={[commonStyles.card, { marginHorizontal: 0, marginBottom: spacing.xxl }]}>
            <Text style={{ fontSize: spacing.xl, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.lg }}>
              {t('byCategory')}
            </Text>
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

