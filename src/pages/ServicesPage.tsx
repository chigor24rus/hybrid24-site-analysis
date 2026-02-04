import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingDialog from '@/components/BookingDialog';

import Breadcrumbs from '@/components/Breadcrumbs';

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
}

const SERVICE_ARTICLE_MAP: Record<string, number> = {
  'Техническое обслуживание': 11,
  'Диагностика двигателя': 15,
  'Замена масла': 16,
  'Шиномонтаж': 19,
  'Ремонт ходовой': 17,
  'Кузовной ремонт': 18,
};

const ServicesPage = () => {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const canonicalUrl = `https://hybrid24.ru${location.pathname}`;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc');
        const data = await response.json();
        
        const uniqueServices = Array.from(
          new Map((data.services || []).map((s: Service) => [s.id, s])).values()
        );
        
        setServices(uniqueServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
    
    const interval = setInterval(fetchServices, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleService = (id: number) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const extractPrice = (priceString: string): number => {
    const match = priceString.match(/(\d+[\s\d]*)/);
    if (match) {
      return parseInt(match[1].replace(/\s/g, ''));
    }
    return 0;
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, id) => {
      const service = services.find(s => s.id === id);
      if (service) {
        return sum + extractPrice(service.price);
      }
      return sum;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Услуги автосервиса в Красноярске - HEVSR | ТО, ремонт, диагностика</title>
        <meta name="description" content="Полный спектр услуг по ремонту и обслуживанию автомобилей в Красноярске. ✓ Техническое обслуживание ✓ Диагностика ✓ Шиномонтаж ✓ Кузовной ремонт. Запись онлайн!" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Услуги автосервиса - HEVSR Красноярск" />
        <meta property="og:description" content="Полный спектр услуг по ремонту и обслуживанию автомобилей в Красноярске" />
      </Helmet>

      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} initialSelectedServices={selectedServices} />
      </Dialog>

      <section className="py-12 md:py-16 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: 'Услуги' }]} />
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Услуги автосервиса в Красноярске</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Полный спектр услуг для вашего автомобиля от профессиональных мастеров
            </p>
          </div>

          <h3 className="text-2xl font-bold text-center mb-8">Популярные услуги</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {services.map((service, index) => {
              const articleId = SERVICE_ARTICLE_MAP[service.title];
              const CardWrapper = articleId ? Link : 'div';
              const wrapperProps = articleId ? { to: `/blog/${articleId}` } : {};
              
              return (
                <CardWrapper key={service.id} {...wrapperProps}>
                  <Card
                    className="hover-scale cursor-pointer hover:border-primary/50 transition-all animate-fade-in h-full"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="w-14 h-14 rounded-lg gradient-primary flex items-center justify-center mb-4">
                        <Icon name={service.icon as any} size={28} className="text-white" />
                      </div>
                      <CardTitle className="text-xl flex items-center justify-between">
                        {service.title}
                        {articleId && <Icon name="ExternalLink" size={16} className="text-muted-foreground" />}
                      </CardTitle>
                      <CardDescription className="text-base">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{service.price}</div>
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <Icon name="Clock" size={14} className="mr-1" />
                            {service.duration}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsBookingOpen(true);
                          }}
                        >
                          Записаться
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardWrapper>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Калькулятор стоимости</h2>
              <p className="text-muted-foreground text-lg">Рассчитайте примерную стоимость услуг</p>
            </div>
            
            <Card className="animate-fade-in">
              <CardHeader>
                <h3 className="text-2xl font-bold mb-2">Выберите необходимые услуги</h3>
                <CardDescription>Отметьте галочками нужные позиции</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(service => (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedServices.includes(service.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleService(service.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{service.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          <div className="flex gap-3 text-sm">
                            <span className="text-primary font-semibold">{service.price}</span>
                            <span className="text-muted-foreground flex items-center">
                              <Icon name="Clock" size={14} className="mr-1" />
                              {service.duration}
                            </span>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedServices.includes(service.id)
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}>
                          {selectedServices.includes(service.id) && (
                            <Icon name="Check" size={16} className="text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedServices.length > 0 && (
                  <div className="p-6 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Выбрано услуг: {selectedServices.length}</div>
                        <div className="text-3xl md:text-4xl font-bold text-primary">
                          {calculateTotal().toLocaleString()} ₽
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Предварительная стоимость</div>
                      </div>
                      <Button 
                        className="gradient-primary btn-glow"
                        onClick={() => setIsBookingOpen(true)}
                      >
                        <Icon name="Calendar" className="mr-2" size={18} />
                        Записаться на услуги
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
};

export default ServicesPage;