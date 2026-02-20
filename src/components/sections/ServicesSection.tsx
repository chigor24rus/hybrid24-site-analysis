import { useState, useEffect, startTransition } from 'react';
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

const SERVICE_ARTICLE_MAP: Record<string, number> = {
  'Техническое обслуживание': 11,
  'Диагностика двигателя': 15,
  'Замена масла': 16,
  'Шиномонтаж': 19,
  'Ремонт ходовой': 17,
  'Кузовной ремонт': 18,
};

interface ServicesSectionProps {
  setIsBookingOpen: (open: boolean) => void;
  setSelectedServices: (services: number[]) => void;
}

const ServicesSection = ({ setIsBookingOpen, setSelectedServices: setParentSelectedServices }: ServicesSectionProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc');
        const data = await response.json();
        
        const uniqueServices = Array.from(
          new Map((data.services || []).map((s: Service) => [s.id, s])).values()
        );
        
        startTransition(() => {
          setAllServices(uniqueServices);
          const shuffled = shuffleArray(uniqueServices);
          setServices(shuffled.slice(0, 6));
        });
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const refreshServices = () => {
    if (allServices.length > 0) {
      const shuffled = shuffleArray(allServices);
      setServices(shuffled.slice(0, 6));
    }
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
            <Link to="/services" className="group inline-block">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-3">
                Наши услуги
                <Icon name="ArrowRight" size={32} className="group-hover:translate-x-2 transition-transform" />
              </h2>
            </Link>
            <p className="text-muted-foreground text-base md:text-lg">Полный спектр услуг для вашего автомобиля</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => {
              const articleId = SERVICE_ARTICLE_MAP[service.title];
              const CardWrapper = articleId ? Link : 'div';
              const wrapperProps = articleId ? { to: `/blog/${articleId}` } : {};
              
              return (
                <CardWrapper key={`service-${service.id}`} {...wrapperProps}>
                  <Card
                    className="hover-scale cursor-pointer hover:border-primary/50 transition-all animate-fade-in h-full"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                        <Icon name={service.icon as any} size={24} className="text-white" />
                      </div>
                      <CardTitle className="flex items-center justify-between">
                        {service.title}
                        {articleId && <Icon name="ExternalLink" size={16} className="text-muted-foreground" />}
                      </CardTitle>
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
          {allServices.length > 6 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Button 
                size="lg" 
                variant="default" 
                onClick={refreshServices}
                className="group hover:scale-105 transition-all"
              >
                <Icon name="RefreshCw" size={18} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Показать другие услуги
              </Button>
              <Link to="/services">
                <Button size="lg" variant="outline" className="group hover:bg-primary hover:text-primary-foreground transition-all">
                  Все услуги
                  <Icon name="ArrowRight" size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

    </>
  );
};

export default ServicesSection;