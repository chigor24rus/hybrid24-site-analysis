import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  
  try {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch {
    return dateString;
  }
};

export const formatDateTimeFull = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  
  try {
    return format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: ru });
  } catch {
    return dateString;
  }
};

export const formatDateTimeLocale = (timestamp: string | null | undefined): string => {
  if (!timestamp) return '—';
  
  try {
    return new Date(timestamp).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return timestamp;
  }
};
