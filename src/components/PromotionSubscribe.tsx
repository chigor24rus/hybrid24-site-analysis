import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/utils/apiClient';

const PromotionSubscribe = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Введите корректный email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.promotions.subscribe, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.already) {
        toast.info('Вы уже подписаны на акции');
      } else if (data.success) {
        toast.success('Спасибо! Вы подписаны на акции', {
          description: 'Мы будем присылать только самые выгодные предложения'
        });
        setEmail('');
      } else {
        toast.error('Что-то пошло не так, попробуйте ещё раз');
      }
    } catch {
      toast.error('Ошибка соединения, попробуйте позже');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="text-center">
        <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
          <Icon name="Bell" size={28} className="text-white" />
        </div>
        <CardTitle className="text-2xl md:text-3xl">Не пропустите новые акции!</CardTitle>
        <CardDescription className="text-base">
          Подпишитесь на рассылку и первыми узнавайте о выгодных предложениях
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="lg"
              className="gradient-primary btn-glow sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={20} className="animate-spin" />
                  Подписка...
                </>
              ) : (
                <>
                  <Icon name="Send" size={20} />
                  Подписаться
                </>
              )}
            </Button>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Icon name="Lock" size={14} className="mt-0.5 flex-shrink-0" />
            <p>
              Мы не передаем ваши данные третьим лицам. Отписаться можно в любой момент.
            </p>
          </div>
        </form>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">-30%</div>
            <div className="text-xs text-muted-foreground">Средняя скидка</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">1-2</div>
            <div className="text-xs text-muted-foreground">Письма в месяц</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">3000+</div>
            <div className="text-xs text-muted-foreground">Подписчиков</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionSubscribe;