import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '@/utils/apiClient';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      return;
    }
    fetch(`${API_ENDPOINTS.promotions.subscribe}?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => setStatus(data.success ? 'success' : 'error'))
      .catch(() => setStatus('error'));
  }, [email]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Icon name="Loader2" size={48} className="animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Обрабатываем запрос...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Icon name="CheckCircle" size={40} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Вы отписались</h1>
              <p className="text-muted-foreground">
                Адрес <strong>{email}</strong> удалён из рассылки акций HEVSR.
                Больше писем приходить не будет.
              </p>
            </div>
            <Button asChild className="gradient-primary">
              <Link to="/">На главную</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Icon name="XCircle" size={40} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Что-то пошло не так</h1>
              <p className="text-muted-foreground">Не удалось обработать запрос. Попробуйте позже.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/">На главную</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnsubscribePage;
