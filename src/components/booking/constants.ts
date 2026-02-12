/**
 * Константы для компонента бронирования
 */

export const BOOKING_CONSTANTS = {
  // Таймауты
  SUCCESS_REDIRECT_DELAY: 2000, // мс до закрытия диалога после успеха
  
  // Валидация
  MIN_NAME_LENGTH: 2,
  PHONE_LENGTH: 11,
  
  // Антиспам защита
  MIN_FORM_FILL_TIME: 2000, // минимальное время заполнения формы (мс)
  RATE_LIMIT_INTERVAL: 30000, // интервал между отправками (мс)
  
  // Сообщения
  CALLBACK_SERVICE_NAME: 'Обратный звонок',
  CALLBACK_TIME: 'Как можно скорее',
  CALLBACK_COMMENT: 'Заявка через виджет обратного звонка',
  PLACEHOLDER_VALUE: 'Не указано',
} as const;

export const NOTIFICATION_MESSAGES = {
  EMAIL_FAILED: 'Email notification failed:',
  TELEGRAM_FAILED: 'Telegram notification failed:',
  MAX_FAILED: 'MAX notification failed:',
  CALLBACK_ERROR: 'Callback error:',
  BOT_DETECTED_HONEYPOT: 'Bot detected: honeypot filled',
  BOT_DETECTED_QUICK: 'Bot detected: form filled too quickly',
} as const;
