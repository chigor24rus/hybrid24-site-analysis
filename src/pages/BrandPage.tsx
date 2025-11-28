import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingDialog from '@/components/BookingDialog';

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  icon: string;
  duration: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

const defaultFeatures = [
  'Оригинальные запчасти',
  'Гарантия на все работы',
  'Специализированное оборудование',
  'Обученные мастера'
];

export default function BrandPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBrandData = async () => {
      if (!brandId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`https://functions.poehali.dev/9fd8ddff-189b-4246-afc3-73d082eb8699?slug=${brandId}`);
        const data = await response.json();
        
        if (response.ok && data.brand) {
          setBrand(data.brand);
          setServices(data.services || []);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching brand data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrandData();
  }, [brandId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header setIsBookingOpen={setIsBookingOpen} />
        <div className="flex-1 flex items-center justify-center">
          <Icon name="Loader" className="animate-spin" size={48} />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header setIsBookingOpen={setIsBookingOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Бренд не найден</h1>
            <Link to="/">
              <Button>На главную</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header setIsBookingOpen={setIsBookingOpen} />
      
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            На главную
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="w-32 h-32 bg-white rounded-2xl p-4 shadow-lg">
              <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <Badge className="mb-3 gradient-accent">Специализация</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{brand.name}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">{brand.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {defaultFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm">
                <Icon name="CheckCircle" className="mx-auto mb-2 text-primary" size={24} />
                <p className="text-sm font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Наши услуги для {brand.name}</h2>
          
          {services.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {services.map((service, index) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-3">
                        <Icon name={service.icon as any} className="text-white" size={24} />
                      </div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">{service.price}</p>
                      <p className="text-sm text-muted-foreground mt-2 flex items-center">
                        <Icon name="Clock" size={14} className="mr-1" />
                        {service.duration}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button size="lg" className="gradient-primary btn-glow" onClick={() => setIsBookingOpen(true)}>
                  Записаться на обслуживание
                  <Icon name="ArrowRight" className="ml-2" size={20} />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="AlertCircle" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Услуги для этого бренда загружаются...</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Нужна консультация?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Наши специалисты по {brand.name} готовы ответить на все ваши вопросы
          </p>
          <Button size="lg" variant="outline" asChild>
            <a href="tel:+79230166750">
              <Icon name="Phone" className="mr-2" size={20} />
              +7 (923) 016-67-50
            </a>
          </Button>
        </div>
      </section>

      <Footer />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>
    </div>
  );
}
