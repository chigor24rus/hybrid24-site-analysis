import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

interface ServicesSectionProps {
  setIsBookingOpen: (open: boolean) => void;
  setSelectedServices: (services: number[]) => void;
}

const ServicesSection = ({ setIsBookingOpen, setSelectedServices: setParentSelectedServices }: ServicesSectionProps) => {
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, brandsRes] = await Promise.all([
          fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc'),
          fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f')
        ]);
        
        const servicesData = await servicesRes.json();
        const brandsData = await brandsRes.json();
        
        const uniqueServices = Array.from(
          new Map((servicesData.services || []).map((s: Service) => [s.id, s])).values()
        );
        
        setServices(uniqueServices);
        setBrands(brandsData.brands || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    const interval = setInterval(fetchData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleService = (id: number) => {
    setSelectedServices(prev => {
      const newServices = prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id];
      setParentSelectedServices(newServices);
      return newServices;
    });
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
      <div className="py-12 md:py-16 text-center">
        <Icon name="Loader" className="animate-spin mx-auto" size={48} />
      </div>
    );
  }

  return (
    <>
      <section id="services" className="py-12 md:py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Наши услуги</h2>
            <p className="text-muted-foreground text-base md:text-lg">Полный спектр услуг для вашего автомобиля</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card
                key={`service-${service.id}`}
                className="hover-scale cursor-pointer hover:border-primary/50 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Icon name={service.icon as any} size={24} className="text-white" />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
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
                    <Button variant="outline" size="sm" onClick={() => setIsBookingOpen(true)}>
                      Записаться
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="calculator" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12 animate-fade-in">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Калькулятор стоимости</h2>
              <p className="text-muted-foreground text-base md:text-lg">Рассчитайте примерную стоимость услуг</p>
            </div>
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Выберите необходимые услуги</CardTitle>
                <CardDescription>Отметьте галочками нужные позиции</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(service => (
                    <div
                      key={`calc-${service.id}`}
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
                  <div className="p-4 md:p-6 rounded-lg border border-primary/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs md:text-sm text-muted-foreground mb-1">Выбрано услуг: {selectedServices.length}</div>
                        <div className="text-2xl md:text-3xl font-bold px-3 py-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-lg inline-block transition-all duration-300">
                          {calculateTotal().toLocaleString()} ₽
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground mt-1">Предварительная стоимость</div>
                      </div>
                      <Button size="lg" className="gradient-primary btn-glow w-full md:w-auto" onClick={() => {
                        setParentSelectedServices(selectedServices);
                        setIsBookingOpen(true);
                      }}>
                        Записаться на услуги
                        <Icon name="ArrowRight" className="ml-2" size={20} />
                      </Button>
                    </div>
                  </div>
                )}

                {selectedServices.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Calculator" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Выберите услуги для расчёта стоимости</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="brands" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <Link to="/brands" className="inline-block group">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 hover:text-primary transition-colors">
                Бренды, с которыми мы работаем
                <Icon name="ExternalLink" className="inline-block ml-3 opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
              </h2>
            </Link>
            <p className="text-muted-foreground text-base md:text-lg">Обслуживаем все популярные марки автомобилей</p>
          </div>
          <div className="relative">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
              aria-label="Прокрутить влево"
            >
              <Icon name="ChevronLeft" size={24} className="text-primary" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
              aria-label="Прокрутить вправо"
            >
              <Icon name="ChevronRight" size={24} className="text-primary" />
            </button>
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
            <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth">
              {brands.map((brand, index) => (
                <Link
                  key={`brand-${brand.id}`}
                  to={`/brand/${brand.slug}`}
                  className="flex-shrink-0"
                >
                  <Card className="hover-scale cursor-pointer text-center p-6 bg-white w-32 h-32 flex flex-col items-center justify-center">
                    <img src={brand.logo} alt={brand.name} className="h-16 object-contain mb-2" />
                    <p className="text-xs font-medium">{brand.name}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesSection;