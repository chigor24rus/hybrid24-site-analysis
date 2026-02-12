/**
 * Валидация телефонного номера
 * Проверяет, что номер содержит 11 цифр и начинается с 7
 */
export const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('7');
};

/**
 * Валидация имени
 * Проверяет минимальную длину и отсутствие опасных символов
 */
export const isValidName = (name: string, minLength: number = 2): boolean => {
  if (name.length < minLength) return false;
  
  // Запрещенные символы для предотвращения XSS
  const dangerousChars = /[<>{}[\]\\/]/;
  return !dangerousChars.test(name);
};

/**
 * Валидация email
 * Простая проверка формата email
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Email необязателен
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Форматирование телефонного номера
 * Формат: +7 (XXX) XXX-XX-XX
 */
export const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const normalizedDigits = digits.startsWith('8') ? '7' + digits.slice(1) : digits;
  
  if (normalizedDigits.length === 0) {
    return '+7';
  }
  
  let formatted = '+7';
  
  if (normalizedDigits.length > 1) {
    formatted += ' (' + normalizedDigits.slice(1, 4);
  }
  if (normalizedDigits.length >= 4) {
    formatted += ') ' + normalizedDigits.slice(4, 7);
  }
  if (normalizedDigits.length >= 7) {
    formatted += '-' + normalizedDigits.slice(7, 9);
  }
  if (normalizedDigits.length >= 9) {
    formatted += '-' + normalizedDigits.slice(9, 11);
  }
  
  return formatted;
};
