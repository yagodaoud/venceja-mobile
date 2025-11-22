// src/components/CollapsibleFilters.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate, SharedValue } from 'react-native-reanimated';
import { Filter, Calendar as CalendarIcon } from 'lucide-react-native';
import { BoletoStatus } from '@/types';
import { DateRange, getCurrentMonthRange, getLastMonthRange, getLast3MonthsRange, getCurrentBimestreRange, areDateRangesEqual, formatDate, getStatusLabel } from '@/lib/utils';
import StatusDropdown from './StatusDropdown';
import { DateRangePicker } from './DatePicker';
import { commonStyles, colors, spacing } from '@/styles';

interface CollapsibleFiltersProps {
    statusFilter: BoletoStatus | 'ALL' | string;
    onStatusChange: (status: BoletoStatus | 'ALL' | string) => void;
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
    isFiltersCollapsed: boolean;
    filterProgress: SharedValue<number>;
    onExpandFilters: () => void;
}

export default function CollapsibleFilters({
    statusFilter,
    onStatusChange,
    dateRange,
    onDateRangeChange,
    isFiltersCollapsed,
    filterProgress,
    onExpandFilters,
}: CollapsibleFiltersProps) {
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

    const filterContainerStyle = useAnimatedStyle(() => {
        const collapsedHeight = 72;
        const expandedHeight = 180;
        const height = interpolate(
            filterProgress.value,
            [0, 1],
            [collapsedHeight, expandedHeight],
            Extrapolate.CLAMP
        );
        return { height };
    });

    const collapsedBarStyle = useAnimatedStyle(() => ({
        opacity: 1 - filterProgress.value,
    }));

    const expandedFiltersStyle = useAnimatedStyle(() => ({
        opacity: filterProgress.value,
    }));

    return (
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
            {/* Collapsed Bar */}
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
                    onPress={onExpandFilters}
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
                    onPress={onExpandFilters}
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

            {/* Expanded Filters */}
            <Animated.View
                style={[expandedFiltersStyle, { zIndex: 1 }]}
                pointerEvents={!isFiltersCollapsed ? 'auto' : 'none'}
            >
                <View style={{ padding: spacing.lg }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                        <TouchableOpacity
                            style={[
                                commonStyles.filterButton,
                                areDateRangesEqual(dateRange, getCurrentMonthRange()) && commonStyles.filterButtonActive
                            ]}
                            onPress={() => onDateRangeChange(getCurrentMonthRange())}
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
                            onPress={() => onDateRangeChange(getLastMonthRange())}
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
                            onPress={() => onDateRangeChange(getLast3MonthsRange())}
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
                            onPress={() => onDateRangeChange(getCurrentBimestreRange())}
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
                            onPress={() => onDateRangeChange(undefined)}
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
                            onStatusChange={onStatusChange}
                        />
                    </View>
                    <View style={{ marginTop: spacing.sm }}>
                        <DateRangePicker
                            dateRange={dateRange}
                            onDateRangeChange={onDateRangeChange}
                        />
                    </View>
                </View>
            </Animated.View>
        </Animated.View>
    );
}