import { useState, useEffect, useRef } from 'react';
import { Phone, X } from 'lucide-react';
import { API_ENDPOINTS } from '@/utils/apiClient';
import { formatPhoneNumber, isValidPhone, isValidName } from '@/utils/validation';
import { BOOKING_CONSTANTS, NOTIFICATION_MESSAGES } from './booking/constants';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Защита 1: Honeypot - скрытое поле для ботов
    if (honeypot) {
      console.warn(NOTIFICATION_MESSAGES.BOT_DETECTED_HONEYPOT);
      return;
    }

    // Защита 2: Минимальное время заполнения формы
    const fillTime = Date.now() - openTimeRef.current;
    if (fillTime < BOOKING_CONSTANTS.MIN_FORM_FILL_TIME) {
      console.warn(NOTIFICATION_MESSAGES.BOT_DETECTED_QUICK);
      setSubmitStatus('error');
      return;
    }

    // Защита 3: Rate limiting
    const now = Date.now();
    if (lastSubmitRef.current && now - lastSubmitRef.current < BOOKING_CONSTANTS.RATE_LIMIT_INTERVAL) {
      setSubmitStatus('ratelimit');
      return;
    }

    // Защита 4: Валидация телефона
    if (!isValidPhone(formData.phone)) {
      setSubmitStatus('error');
      return;
    }

    // Защита 5: Валидация имени
    if (!isValidName(formData.name)) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const createBookingResponse = await fetch(API_ENDPOINTS.bookings.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: '',
          service: BOOKING_CONSTANTS.CALLBACK_SERVICE_NAME,
          brand: '',
          model: '',
          date: '',
          time: BOOKING_CONSTANTS.CALLBACK_TIME,
          comment: BOOKING_CONSTANTS.CALLBACK_COMMENT
        })
      });

      if (createBookingResponse.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', phone: '+7' });
        lastSubmitRef.current = Date.now();
        
        const bookingData = {
          customer_name: formData.name.trim(),
          customer_phone: formData.phone.trim(),
          customer_email: BOOKING_CONSTANTS.PLACEHOLDER_VALUE,
          service_type: BOOKING_CONSTANTS.CALLBACK_SERVICE_NAME,
          car_brand: BOOKING_CONSTANTS.PLACEHOLDER_VALUE,
          car_model: BOOKING_CONSTANTS.PLACEHOLDER_VALUE,
          preferred_date: BOOKING_CONSTANTS.CALLBACK_TIME,
          preferred_time: BOOKING_CONSTANTS.CALLBACK_TIME,
          comment: BOOKING_CONSTANTS.CALLBACK_COMMENT
        };
        
        fetch(API_ENDPOINTS.email.sendBooking, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        }).catch(err => console.warn(NOTIFICATION_MESSAGES.EMAIL_FAILED, err));
        
        fetch(API_ENDPOINTS.telegram.send, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        }).catch(err => console.warn(NOTIFICATION_MESSAGES.TELEGRAM_FAILED, err));
        
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
        }, BOOKING_CONSTANTS.SUCCESS_REDIRECT_DELAY);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error(NOTIFICATION_MESSAGES.CALLBACK_ERROR, error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Кнопка виджета */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center gap-2 group"
        aria-label="Заказать обратный звонок"
      >
        <Phone className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Обратный звонок
        </span>
      </button>

      {/* Модальное окно */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
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