import { format, parse, isAfter, addDays, isBefore, isWithinInterval, isValid as isValidDateFns } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Boleto, BoletoStatus } from '@/types';

// Currency formatting (R$ 1.234,56)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Helper function to parse date from various formats (ISO or DD/MM/YYYY)
const parseDateString = (dateString: string | Date): Date => {
  // Check if it's already a Date object
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // Check if it's an ISO format (contains T, Z, or matches YYYY-MM-DD pattern)
  if (dateString.includes('T') || dateString.includes('Z') || /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
  }
  
  // Try parsing as DD/MM/YYYY format (most common format from API)
  // Check if it matches DD/MM/YYYY pattern (with or without time)
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
    // Extract just the date part if there's a time component
    const datePart = dateString.split(' ')[0];
    const parsedDate = parse(datePart, 'dd/MM/yyyy', new Date());
    if (isValidDateFns(parsedDate)) {
      return parsedDate;
    }
  }
  
  // Fallback: try parsing as ISO date
  const fallbackDate = new Date(dateString);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }
  
  // Last resort: return current date if parsing fails completely
  console.warn(`Failed to parse date: ${dateString}`);
  return new Date();
};

// Date formatting (DD/MM/YYYY)
export const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseDateString(date) : date;
    if (!isValidDateFns(dateObj)) {
      return date as string; // Return original string if invalid
    }
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    // If parsing fails, return the original string
    return typeof date === 'string' ? date : format(date, 'dd/MM/yyyy', { locale: ptBR });
  }
};

// Parse date from DD/MM/YYYY
export const parseDate = (dateString: string): Date => {
  return parseDateString(dateString);
};

// Check if boleto is expired (VENCIDO)
export const isBoletoVencido = (vencimento: string): boolean => {
  try {
    const vencimentoDate = parseDateString(vencimento);
    if (!isValidDateFns(vencimentoDate)) {
      return false; // If date is invalid, don't consider it expired
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    vencimentoDate.setHours(0, 0, 0, 0);
    return isBefore(vencimentoDate, today);
  } catch (error) {
    return false; // If parsing fails, don't consider it expired
  }
};

// Check if boleto is expiring in 3 days
export const isBoletoExpiringSoon = (vencimento: string): boolean => {
  try {
    const vencimentoDate = parseDateString(vencimento);
    if (!isValidDateFns(vencimentoDate)) {
      return false; // If date is invalid, don't consider it expiring soon
    }
    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);
    today.setHours(0, 0, 0, 0);
    vencimentoDate.setHours(0, 0, 0, 0);
    threeDaysFromNow.setHours(23, 59, 59, 999);
    
    return (
      isWithinInterval(vencimentoDate, { start: today, end: threeDaysFromNow }) ||
      (isBefore(vencimentoDate, threeDaysFromNow) && !isBefore(vencimentoDate, today))
    );
  } catch (error) {
    return false; // If parsing fails, don't consider it expiring soon
  }
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
  try {
    const dateObj = typeof date === 'string' ? parseDateString(date) : date;
    if (!isValidDateFns(dateObj)) {
      return typeof date === 'string' ? date : format(date, 'dd/MM/yyyy');
    }
    return format(dateObj, 'dd/MM/yyyy');
  } catch (error) {
    return typeof date === 'string' ? date : format(date, 'dd/MM/yyyy');
  }
};

// Validate date format (DD/MM/YYYY or ISO)
export const isValidDate = (dateString: string): boolean => {
  try {
    const parsed = parseDateString(dateString);
    return isValidDateFns(parsed);
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

