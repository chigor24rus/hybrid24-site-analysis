import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import Footer from '@/components/Footer';

import ScrollToTopButton from '@/components/ScrollToTopButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_CONFIG } from '@/config/site';

const BonusProgramPage = () => {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const canonicalUrl = `${SITE_CONFIG.domain}${location.pathname}`;

  const bonusLevels = [
    {
      level: 'Базовый',
      minSpend: 0,
      discount: 3,
      icon: 'Star',
      color: 'text-gray-500',
      benefits: ['3% скидка на все услуги', 'Бесплатная диагностика при первом визите', 'SMS-напоминания о ТО']
    },
    {
      level: 'Серебряный',
      minSpend: 30000,
      discount: 5,
      icon: 'Award',
      color: 'text-gray-400',
      benefits: ['5% скидка на все услуги', 'Приоритетная запись', 'Скидка 10% на запчасти', 'Подменный автомобиль']
    },
    {
      level: 'Золотой',
      minSpend: 75000,
      discount: 7,
      icon: 'Trophy',
      color: 'text-yellow-500',
      benefits: ['7% скидка на все услуги', 'Первоочередное обслуживание', 'Скидка 15% на запчасти', 'Бесплатная мойка', 'Доставка авто']
    },
    {
      level: 'Платиновый',
      minSpend: 150000,
      discount: 10,
      icon: 'Crown',
      color: 'text-purple-500',
      benefits: ['10% скидка на все услуги', 'VIP-обслуживание', 'Скидка 20% на запчасти', 'Годовое ТО в подарок', 'Персональный менеджер']
    }
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Бонусная программа HEVSR Красноярск - скидки до 10%</title>
        <meta name="description" content="Бонусная программа лояльности в Красноярске. ✓ Скидки до 10% ✓ VIP-обслуживание ✓ Бесплатная мойка. Накапливайте бонусы!" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Условия бонусной программы - HEVSR" />
        <meta property="og:description" content="Бонусная программа лояльности автосервиса HEVSR. Накапливайте бонусы и получайте скидки до 10%" />
        <meta property="og:site_name" content="HEVSR" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Условия бонусной программы - HEVSR" />
        <meta name="twitter:description" content="Накапливайте бонусы и получайте скидки до 10%" />
        <meta name="twitter:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
      </Helmet>
      
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <section className="py-12 md:py-20 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: 'Бонусная программа' }]} />
          
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <Badge className="mb-4 gradient-accent text-sm">Программа лояльности</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Бонусная программа HEVSR в Красноярске</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Получайте скидки и привилегии за обслуживание в нашем автосервисе
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bonusLevels.map((level, index) => (
                <Card 
                  key={index} 
                  className="hover-scale animate-fade-in relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-lg gradient-primary flex items-center justify-center mb-4 ${level.color}`}>
                      <Icon name={level.icon as any} size={32} />
                    </div>
                    <CardTitle className="text-2xl">{level.level}</CardTitle>
                    <CardDescription>
                      {level.minSpend > 0 ? `От ${level.minSpend.toLocaleString('ru-RU')} ₽` : 'С первого визита'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="text-4xl font-bold gradient-text">{level.discount}%</div>
                      <div className="text-sm text-muted-foreground">постоянная скидка</div>
                    </div>
                    <ul className="space-y-2">
                      {level.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <Icon name="Check" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Как работает программа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
                      <Icon name="UserPlus" size={28} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">1. Регистрация</h3>
                    <p className="text-muted-foreground text-sm">
                      Запишитесь на обслуживание и станьте участником программы автоматически
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
                      <Icon name="TrendingUp" size={28} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">2. Накопление</h3>
                    <p className="text-muted-foreground text-sm">
                      Сумма всех ваших визитов накапливается и повышает ваш уровень
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
                      <Icon name="Gift" size={28} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">3. Привилегии</h3>
                    <p className="text-muted-foreground text-sm">
                      Получайте скидки и дополнительные бонусы при каждом визите
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '500ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Правила программы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Автоматическое участие:</strong> Все клиенты автоматически становятся участниками программы с первого визита
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Накопление уровня:</strong> Уровень определяется общей суммой услуг за последние 12 месяцев
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Применение скидки:</strong> Скидка применяется на работы и услуги. На запчасти действуют отдельные условия
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Несуммируемость:</strong> Скидка по бонусной программе не суммируется с акциями и спецпредложениями
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Сохранение уровня:</strong> Уровень сохраняется в течение 12 месяцев с момента достижения
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Передача карты:</strong> Карта участника является именной и не подлежит передаче третьим лицам
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Изменение условий:</strong> Автосервис оставляет за собой право изменять условия программы с уведомлением участников
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '600ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Дополнительные преимущества</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Icon name="Bell" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Напоминания о ТО</h4>
                        <p className="text-sm text-muted-foreground">Мы напомним когда пора на плановое обслуживание</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Icon name="Tag" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Эксклюзивные акции</h4>
                        <p className="text-sm text-muted-foreground">Специальные предложения только для участников программы</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Icon name="Calendar" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Приоритетная запись</h4>
                        <p className="text-sm text-muted-foreground">Забронируйте удобное время раньше других</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Icon name="Gift" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Подарки за лояльность</h4>
                        <p className="text-sm text-muted-foreground">Приятные сюрпризы в день рождения и праздники</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center animate-fade-in" style={{ animationDelay: '700ms' }}>
              <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold mb-4">Присоединяйтесь к программе</h3>
                  <p className="text-muted-foreground mb-6">
                    Запишитесь на обслуживание и начните получать привилегии уже сегодня
                  </p>
                  <Button 
                    size="lg" 
                    className="gradient-primary btn-glow"
                    onClick={() => setIsBookingOpen(true)}
                  >
                    <Icon name="Gift" size={20} />
                    Записаться на обслуживание
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <ScrollToTopButton />
    </div>
  );
};

export default BonusProgramPage;