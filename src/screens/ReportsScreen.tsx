import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBoletos } from '@/hooks/useBoletos';
import { useTranslation } from 'react-i18next';
import { formatCurrency, DateRange, getCurrentMonthRange, getLastMonthRange, getLast3MonthsRange, getCurrentBimestreRange, areDateRangesEqual, toDDMMYYYY, calculateStatus } from '@/lib/utils';
import { PieChart } from 'react-native-chart-kit';
import { Download, Calendar as CalendarIcon } from 'lucide-react-native';
import { DateRangePicker } from '@/components/DatePicker';
import { commonStyles, colors, spacing, shadows } from '@/styles';

const screenWidth = Dimensions.get('window').width;

// Chart colors matching web version
const CHART_COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#00BCD4', '#795548', '#607D8B', '#E91E63', '#009688'];

export default function ReportsScreen() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getCurrentMonthRange());

  const { boletos } = useBoletos({
    dataInicio: dateRange?.from ? toDDMMYYYY(dateRange.from) : undefined,
    dataFim: dateRange?.to ? toDDMMYYYY(dateRange.to) : undefined,
    size: 1000,
  });

  // Calculate totals using status directly from boleto (with fallback to calculateStatus)
  const totalPago = boletos
    .filter((b) => (b.status || calculateStatus(b)) === 'PAGO')
    .reduce((sum, b) => sum + b.valor, 0);

  const totalPendente = boletos
    .filter((b) => (b.status || calculateStatus(b)) === 'PENDENTE')
    .reduce((sum, b) => sum + b.valor, 0);

  // Group by category - ALL categories (not just top 5)
  const categoryDataMap = boletos.reduce((acc: Record<string, number>, boleto) => {
    const category = boleto.categoria?.nome || 'Sem categoria';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += boleto.valor;
    return acc;
  }, {});

  // Calculate total for percentage calculation
  const totalValue = Object.values(categoryDataMap).reduce((sum, value) => sum + value, 0);

  // Convert to chart data format with consistent colors and formatted labels
  const chartData = Object.entries(categoryDataMap)
    .map(([categoryName, value], index) => {
      // Store category name and formatted amount separately for custom legend
      const cleanCategoryName = categoryName.trim();
      const formattedAmount = formatCurrency(value);
      const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0.0';
      return {
        name: '', // Empty name for chart (we'll use custom legend)
        categoryName: cleanCategoryName,
        formattedAmount: formattedAmount,
        percentage: percentage,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
        legendFontColor: colors.text.tertiary,
        legendFontSize: 12,
      };
    })
    .sort((a, b) => b.value - a.value); // Sort by value descending

  const handleExportCSV = async () => {
    const headers = ['Fornecedor', 'Valor', 'Vencimento', 'Status', 'Categoria'];
    const rows = boletos.map((b) => [
      b.fornecedor,
      formatCurrency(b.valor),
      b.vencimento,
      b.status || calculateStatus(b),
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
    <SafeAreaView style={[commonStyles.screenContainer, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <View style={commonStyles.screenHeader}>
        <View>
          <Text style={commonStyles.screenTitle}>{t('reports')}</Text>
          <Text style={commonStyles.screenSubtitle}>Visualize estatísticas e exporte dados</Text>
        </View>
        <TouchableOpacity
          onPress={handleExportCSV}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            ...shadows.md,
          }}
        >
          <Download size={24} color={colors.text.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[commonStyles.screenContent, { backgroundColor: colors.background.primary }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        {/* Date Range Filter Section */}
        <View style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <CalendarIcon size={20} color={colors.primary} />
            <Text style={{ fontSize: spacing.lg, fontWeight: '600', color: colors.text.primary }}>
              {t('filter') || 'Filtrar'}
            </Text>
          </View>

          {/* Preset date range buttons */}
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

          {/* Custom Date Range Picker */}
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </View>

        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxl }}>
          <View style={[commonStyles.card, { flex: 1, marginHorizontal: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: spacing.sm, color: colors.text.tertiary, marginBottom: spacing.sm }}>
              {t('totalPaid')}
            </Text>
            <Text style={{ fontSize: spacing.xl, fontWeight: '700', color: colors.status.pago }}>
              {formatCurrency(totalPago)}
            </Text>
          </View>
          <View style={[commonStyles.card, { flex: 1, marginHorizontal: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: spacing.sm, color: colors.text.tertiary, marginBottom: spacing.sm }}>
              {t('totalPending')}
            </Text>
            <Text style={{ fontSize: spacing.xl, fontWeight: '700', color: colors.status.pendente }}>
              {formatCurrency(totalPendente)}
            </Text>
          </View>
        </View>

        {/* Pie Chart */}
        {chartData.length > 0 ? (
          <View style={[commonStyles.card, { marginHorizontal: 0, marginBottom: spacing.xxl }]}>
            <Text style={{ fontSize: spacing.xl, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.xs }}>
              {t('byCategoryExpenses') || 'Gasto por Categoria'}
            </Text>
            <Text style={{ fontSize: spacing.md, color: colors.text.tertiary, marginBottom: spacing.lg }}>
              {t('distributionOfExpensesByCategory') || 'Distribuição de gastos por categoria'}
            </Text>
            {/* Chart Container - Aligned to the right, no side legends */}
            <View style={{ width: '100%', marginLeft: 0, marginRight: -spacing.lg, paddingRight: spacing.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
                <PieChart
                  data={chartData.map(item => ({ ...item, name: '' }))}
                  width={Math.min(screenWidth - (spacing.lg * 4), 280)}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  }}
                  accessor="value"
                  backgroundColor="transparent"
                  paddingLeft="60"
                  hasLegend={false}
                />
              </View>
            </View>
            {/* Custom Legend - Centered */}
            <View style={{ marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: spacing.md, paddingHorizontal: spacing.sm }}>
              {chartData.map((item, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, width: '45%', maxWidth: 200 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color, marginRight: spacing.sm, marginTop: 2, flexShrink: 0 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: spacing.md, color: colors.text.secondary, fontWeight: '500' }}>
                      {item.categoryName} - {item.percentage}%
                    </Text>
                    <Text style={{ fontSize: spacing.md, color: colors.text.tertiary, marginTop: 2, fontWeight: '600' }}>
                      {item.formattedAmount}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={[commonStyles.card, { marginHorizontal: 0, padding: spacing.xxl, alignItems: 'center' }]}>
            <Text style={{ fontSize: spacing.lg, color: colors.text.tertiary }}>
              Nenhum dado disponível
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

