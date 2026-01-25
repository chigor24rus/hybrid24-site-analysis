import { useState } from 'react';
import { Phone, X } from 'lucide-react';

export default function CallbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://z31.fpg.ru/zeon/api/callback/start.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          host: window.location.host,
          code: 'cfcd208495d565ef66e7dff9f98764da',
          method: 'send',
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', phone: '' });
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Callback error:', error);
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
                <div>
                  <label htmlFor="callback-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ваше имя
                  </label>
                  <input
                    id="callback-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent outline-none transition-all"
                    placeholder="Иван"
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent outline-none transition-all"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                {submitStatus === 'error' && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    Произошла ошибка. Попробуйте позвонить по номеру +7(923)0166750
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
