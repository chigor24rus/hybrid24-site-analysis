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
import FloatingCallButton from '@/components/FloatingCallButton';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Breadcrumbs from '@/components/Breadcrumbs';

const WarrantyPage = () => {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const canonicalUrl = `https://hybrid24.ru${location.pathname}`;

  const warrantyPeriods = [
    {
      service: 'Диагностика',
      period: '1 месяц',
      icon: 'Search',
      description: 'На результаты компьютерной и визуальной диагностики'
    },
    {
      service: 'Ремонт двигателя',
      period: '12 месяцев',
      icon: 'Cog',
      description: 'Капитальный и текущий ремонт двигателя'
    },
    {
      service: 'Ремонт трансмиссии',
      period: '12 месяцев',
      icon: 'Settings',
      description: 'АКПП, МКПП, вариатор, роботизированные КПП'
    },
    {
      service: 'Ремонт подвески',
      period: '6 месяцев',
      icon: 'Wrench',
      description: 'Замена амортизаторов, пружин, рычагов'
    },
    {
      service: 'Электрика',
      period: '6 месяцев',
      icon: 'Zap',
      description: 'Ремонт электрооборудования и проводки'
    },
    {
      service: 'ТО и замена жидкостей',
      period: '3 месяца',
      icon: 'Droplet',
      description: 'Плановое техническое обслуживание'
    }
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Гарантийная политика - HEVSR</title>
        <meta name="description" content="Гарантийная политика автосервиса HEVSR в Красноярске. Гарантия на все виды работ до 12 месяцев. Прозрачные условия и полная ответственность за качество" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Гарантийная политика - HEVSR" />
        <meta property="og:description" content="Гарантия на все виды работ до 12 месяцев. Прозрачные условия и полная ответственность за качество" />
        <meta property="og:site_name" content="HEVSR" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Гарантийная политика - HEVSR" />
        <meta name="twitter:description" content="Гарантия на работы до 12 месяцев" />
        <meta name="twitter:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
      </Helmet>
      
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <section className="py-12 md:py-20 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: 'Гарантийная политика' }]} />
          
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <Badge className="mb-4 gradient-accent text-sm">Качество и надежность</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Гарантийная политика</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Мы отвечаем за качество выполненных работ и используемых запчастей
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl">Сроки гарантии на работы</CardTitle>
                <CardDescription>
                  Гарантийные обязательства распространяются на все виды выполненных работ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {warrantyPeriods.map((item, index) => (
                    <div 
                      key={index}
                      className="p-4 border rounded-lg hover-scale"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                          <Icon name={item.icon as any} size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.service}</h3>
                          <Badge variant="secondary" className="mt-1">{item.period}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Условия гарантии</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Icon name="Shield" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Бесплатное устранение дефектов:</strong> При выявлении недостатков в работе по вине автосервиса, мы устраним их за свой счет в кратчайшие сроки
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="FileCheck" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Документальное подтверждение:</strong> Каждый заказ-наряд содержит перечень выполненных работ с указанием гарантийного срока
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="Package" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Гарантия на запчасти:</strong> На установленные нами запчасти распространяется гарантия производителя (от 12 до 24 месяцев)
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="Clock" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Срок действия:</strong> Гарантийный срок начинается с даты выполнения работ, указанной в заказ-наряде
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Гарантия не распространяется</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Icon name="XCircle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Естественный износ:</strong> На детали с естественным износом (тормозные колодки, свечи, фильтры, щетки стеклоочистителей)
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="XCircle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Несоблюдение рекомендаций:</strong> При нарушении правил эксплуатации автомобиля после ремонта
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="XCircle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Вмешательство третьих лиц:</strong> При самостоятельном ремонте или обращении в другие сервисы после наших работ
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="XCircle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">ДТП и форс-мажор:</strong> На повреждения, полученные в результате аварий, стихийных бедствий, умышленных действий
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Icon name="XCircle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Отказ от рекомендаций:</strong> При отказе клиента от выполнения рекомендованных работ по устранению неисправностей
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '500ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Порядок обращения по гарантии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <h4 className="font-semibold mb-2">Свяжитесь с нами</h4>
                    <p className="text-sm text-muted-foreground">
                      Позвоните или приезжайте в сервис с заказ-нарядом
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <h4 className="font-semibold mb-2">Диагностика</h4>
                    <p className="text-sm text-muted-foreground">
                      Наши мастера проведут диагностику для выявления причины неисправности
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <h4 className="font-semibold mb-2">Решение</h4>
                    <p className="text-sm text-muted-foreground">
                      Определим является ли случай гарантийным и согласуем план действий
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">4</span>
                    </div>
                    <h4 className="font-semibold mb-2">Ремонт</h4>
                    <p className="text-sm text-muted-foreground">
                      Устраним дефект бесплатно в рамках гарантийных обязательств
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '600ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Необходимые документы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Icon name="FileText" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Заказ-наряд</h4>
                        <p className="text-sm text-muted-foreground">
                          Оригинал заказ-наряда с печатью и подписью
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Icon name="CreditCard" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Документы на авто</h4>
                        <p className="text-sm text-muted-foreground">
                          СТС или ПТС автомобиля для идентификации
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Icon name="User" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Документ личности</h4>
                        <p className="text-sm text-muted-foreground">
                          Паспорт владельца автомобиля или доверенность
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Icon name="Receipt" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Чек об оплате</h4>
                        <p className="text-sm text-muted-foreground">
                          Квитанция или чек, подтверждающий оплату услуг
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center animate-fade-in" style={{ animationDelay: '700ms' }}>
              <Card className="max-w-2xl mx-auto border-primary/50">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Icon name="ShieldCheck" size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Наша ответственность</h3>
                  <p className="text-muted-foreground mb-6">
                    Мы гарантируем качество выполненных работ и несем полную ответственность за результат. Ваше доверие — наш главный приоритет.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="gradient-primary btn-glow"
                      onClick={() => setIsBookingOpen(true)}
                    >
                      <Icon name="Calendar" size={20} />
                      Записаться на сервис
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => window.location.href = 'tel:+79230166750'}
                    >
                      <Icon name="Phone" size={20} />
                      +7 (923) 016-67-50
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingCallButton />
      <ScrollToTopButton />
    </div>
  );
};

export default WarrantyPage;