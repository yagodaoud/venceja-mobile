import { format, parse, isAfter, addDays, isBefore, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Boleto, BoletoStatus } from '@/types';

// Currency formatting (R$ 1.234,56)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Date formatting (DD/MM/YYYY)
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

// Parse date from DD/MM/YYYY
export const parseDate = (dateString: string): Date => {
  return parse(dateString, 'dd/MM/yyyy', new Date());
};

// Check if boleto is expired (VENCIDO)
export const isBoletoVencido = (vencimento: string): boolean => {
  const vencimentoDate = new Date(vencimento);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  vencimentoDate.setHours(0, 0, 0, 0);
  return isBefore(vencimentoDate, today);
};

// Check if boleto is expiring in 3 days
export const isBoletoExpiringSoon = (vencimento: string): boolean => {
  const vencimentoDate = new Date(vencimento);
  const today = new Date();
  const threeDaysFromNow = addDays(today, 3);
  today.setHours(0, 0, 0, 0);
  vencimentoDate.setHours(0, 0, 0, 0);
  threeDaysFromNow.setHours(23, 59, 59, 999);
  
  return (
    isWithinInterval(vencimentoDate, { start: today, end: threeDaysFromNow }) ||
    isBefore(vencimentoDate, threeDaysFromNow) && !isBefore(vencimentoDate, today)
  );
};

// Calculate status (client-side for offline)
export const calculateStatus = (boleto: Boleto): BoletoStatus => {
  if (boleto.status === 'PAGO') {
    return 'PAGO';
  }
  if (isBoletoVencido(boleto.vencimento)) {
    return 'VENCIDO';
  }
  return 'PENDENTE';
};

// Get status color
export const getStatusColor = (status: BoletoStatus): string => {
  switch (status) {
    case 'PAGO':
      return '#4CAF50';
    case 'VENCIDO':
      return '#F44336';
    case 'PENDENTE':
      return '#FF9800';
    default:
      return '#757575';
  }
};

// Get status label (PT-BR)
export const getStatusLabel = (status: BoletoStatus): string => {
  switch (status) {
    case 'PAGO':
      return 'Pago';
    case 'VENCIDO':
      return 'Vencido';
    case 'PENDENTE':
      return 'Pendente';
    default:
      return status;
  }
};

// Convert date to DD/MM/YYYY format
export const toDDMMYYYY = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy');
};

// Validate date format (DD/MM/YYYY)
export const isValidDate = (dateString: string): boolean => {
  try {
    const parsed = parseDate(dateString);
    return !isNaN(parsed.getTime());
  } catch {
    return false;
  }
};

// Quick date range filters
export const getDateRange = (range: 'este-mes' | 'ultimos-3-meses' | 'este-ano'): { inicio: string; fim: string } => {
  const today = new Date();
  let inicio: Date;
  let fim: Date = new Date(today);

  switch (range) {
    case 'este-mes':
      inicio = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'ultimos-3-meses':
      inicio = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      break;
    case 'este-ano':
      inicio = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      inicio = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  return {
    inicio: toDDMMYYYY(inicio),
    fim: toDDMMYYYY(fim),
  };
};

