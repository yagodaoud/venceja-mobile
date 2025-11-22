import { useState } from 'react';
import { BoletoStatus } from '@/types';
import { DateRange, getCurrentMonthRange, toDDMMYYYY } from '@/lib/utils';

export const useDashboardFilters = () => {
    const [statusFilter, setStatusFilter] = useState<BoletoStatus | 'ALL' | string>('PENDENTE,VENCIDO');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(getCurrentMonthRange());

    const filters = {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        dataInicio: dateRange?.from ? toDDMMYYYY(dateRange.from) : undefined,
        dataFim: dateRange?.to ? toDDMMYYYY(dateRange.to) : undefined,
        sortBy: 'vencimento',
        direction: 'asc' as const,
        page: 0,
        size: 20,
    };

    return {
        statusFilter,
        setStatusFilter,
        dateRange,
        setDateRange,
        filters,
    };
};