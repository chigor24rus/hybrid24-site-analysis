import { useState, useEffect, useRef } from 'react';
import { Phone, X } from 'lucide-react';

export default function CallbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '+7' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'ratelimit'>('idle');
  const [honeypot, setHoneypot] = useState('');
  const openTimeRef = useRef<number>(0);
  const lastSubmitRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = Date.now();
    }
  }, [isOpen]);

  const formatPhoneNumber = (value: string) => {
    // Удаляем все, кроме цифр
    const digits = value.replace(/\D/g, '');
    
    // Если пользователь начал вводить с 8, заменяем на 7
    const normalizedDigits = digits.startsWith('8') ? '7' + digits.slice(1) : digits;
    
    // Форматируем номер: +7 (XXX) XXX-XX-XX
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Если пользователь удаляет всё, оставляем +7
    if (input.length < 2) {
      setFormData({ ...formData, phone: '+7' });
      return;
    }
    
    // Форматируем номер
    const formatted = formatPhoneNumber(input);
    setFormData({ ...formData, phone: formatted });
  };

  const logError = (context: string, error: any, details?: any) => {
    const errorData = {
      timestamp: new Date().toISOString(),
      context,
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : String(error),
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      host: window.location.host
    };
    
    console.error('[CallbackWidget Error]', errorData);
    
    try {
      const errors = JSON.parse(localStorage.getItem('callback_errors') || '[]');
      errors.push(errorData);
      if (errors.length > 50) errors.shift();
      localStorage.setItem('callback_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to save error to localStorage', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Защита 1: Honeypot - скрытое поле для ботов
      if (honeypot) {
        logError('bot_detection', 'Honeypot filled', { honeypot });
        return;
      }

      // Защита 2: Минимальное время заполнения формы (2 секунды)
      const fillTime = Date.now() - openTimeRef.current;
      if (fillTime < 2000) {
        logError('bot_detection', 'Form filled too quickly', { fillTime });
        setSubmitStatus('error');
        return;
      }

      // Защита 3: Rate limiting - не более 1 запроса в 30 секунд
      const now = Date.now();
      if (lastSubmitRef.current && now - lastSubmitRef.current < 30000) {
        const timeSinceLastSubmit = now - lastSubmitRef.current;
        logError('rate_limit', 'Too many requests', { timeSinceLastSubmit });
        setSubmitStatus('ratelimit');
        return;
      }

      // Защита 4: Валидация телефона (должен быть полный номер +7XXXXXXXXXX - 11 цифр)
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
        logError('validation', 'Invalid phone number', { phone: formData.phone, phoneDigits });
        setSubmitStatus('error');
        return;
      }

      // Защита 5: Валидация имени (минимум 2 символа, без спецсимволов)
      if (formData.name.length < 2 || /[<>{}[\]\\\/]/.test(formData.name)) {
        logError('validation', 'Invalid name', { name: formData.name });
        setSubmitStatus('error');
        return;
      }

      setIsSubmitting(true);
      setSubmitStatus('idle');

      const requestBody = new URLSearchParams({
        host: window.location.host,
        code: 'cfcd208495d565ef66e7dff9f98764da',
        method: 'send',
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      console.log('[CallbackWidget] Sending request', {
        url: 'https://z31.fpg.ru/zeon/api/callback/start.php',
        host: window.location.host,
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });

      const response = await fetch('https://z31.fpg.ru/zeon/api/callback/start.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: requestBody,
      });

      const responseText = await response.text();
      
      console.log('[CallbackWidget] Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });

      if (response.ok) {
        console.log('[CallbackWidget] Request successful');
        setSubmitStatus('success');
        setFormData({ name: '', phone: '+7' });
        lastSubmitRef.current = Date.now();
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
        }, 2000);
      } else {
        logError('api_error', 'Request failed', {
          status: response.status,
          statusText: response.statusText,
          responseBody: responseText,
          requestData: {
            host: window.location.host,
            name: formData.name.trim(),
            phone: formData.phone.trim()
          }
        });
        setSubmitStatus('error');
      }
    } catch (error) {
      logError('network_error', error, {
        formData: {
          name: formData.name,
          phone: formData.phone
        }
      });
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Кнопка виджета */}
      <button
        onClick={() => {
          console.log('Callback button clicked');
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-[9999] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center gap-2 group"
        aria-label="Заказать обратный звонок"
        style={{ pointerEvents: 'auto' }}
      >
        <Phone className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Обратный звонок
        </span>
      </button>

      {/* Модальное окно */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 bg-[hsl(var(--primary))]/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Обратный звонок</h2>
              <p className="text-gray-600">Оставьте номер телефона, и мы свяжемся с вами в течение 5 минут</p>
            </div>

            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Заявка отправлена!</h3>
                <p className="text-gray-600">Мы свяжемся с вами в ближайшее время</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot - скрытое поле для ботов */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div>
                  <label htmlFor="callback-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ваше имя
                  </label>
                  <input
                    id="callback-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent outline-none transition-all"
                    placeholder="Иван"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="callback-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Номер телефона
                  </label>
                  <input
                    id="callback-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent outline-none transition-all"
                    placeholder="+7 (999) 123-45-67"
                    autoComplete="tel"
                    maxLength={18}
                  />
                </div>

                {submitStatus === 'error' && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    Проверьте правильность заполнения полей или позвоните по номеру +7(923)0166750
                  </div>
                )}

                {submitStatus === 'ratelimit' && (
                  <div className="text-orange-600 text-sm bg-orange-50 p-3 rounded-lg">
                    Заявка уже отправлена. Подождите 30 секунд перед повторной отправкой.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      Заказать звонок
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}