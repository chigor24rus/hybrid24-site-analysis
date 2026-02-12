/**
 * Booking module - централизованный экспорт всех компонентов и утилит бронирования
 */

export { default as BookingDialog } from '../BookingDialog';
export { default as ServiceSelector, services } from './ServiceSelector';
export { default as DateTimeSelector } from './DateTimeSelector';
export { default as ContactForm } from './ContactForm';

export { useBookingData } from './useBookingData';
export { useBookingSubmit } from './useBookingSubmit';

export { BOOKING_CONSTANTS, NOTIFICATION_MESSAGES } from './constants';

export type {
  Brand,
  Model,
  Promotion,
  BookingFormData,
  BookingDialogProps,
} from './types';
