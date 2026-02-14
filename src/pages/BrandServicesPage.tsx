import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import BookingDialog from '@/components/BookingDialog';
import { Dialog } from '@/components/ui/dialog';
import { SITE_CONFIG } from '@/config/site';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
}

interface Price {
  id: number;
  service_id: number;
  brand_id: number;
  base_price: number;
  currency: string;
}

export default function BrandServicesPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, servicesRes, pricesRes] = await Promise.all([
          fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
          fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc'),
          fetch('https://functions.poehali.dev/0cce410b-a4a1-4420-8df0-90d95a5055b7'),
        ]);

        const [brandsData, servicesData, pricesData] = await Promise.all([
          brandsRes.json(),
          servicesRes.json(),
          pricesRes.json(),
        ]);

        const brands: Brand[] = brandsData.brands || [];
        const allServices: Service[] = servicesData.services || [];
        const allPrices: Price[] = pricesData.prices || [];

        const foundBrand = brands.find(b => 
          b.name.toLowerCase().replace(/\s+/g, '-') === brandSlug
        );

        if (!foundBrand) {
          navigate('/404');
          return;
        }

        const brandPrices = allPrices.filter(p => p.brand_id === foundBrand.id);
        const servicesWithPrices = allServices
          .filter(service => brandPrices.some(p => p.service_id === service.id))
          .sort((a, b) => a.title.localeCompare(b.title, 'ru'));

        setBrand({
          ...foundBrand,
          slug: foundBrand.name.toLowerCase().replace(/\s+/g, '-')
        });
        setServices(servicesWithPrices);
        setPrices(brandPrices);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!brand) {
    return null;
  }

  const getServicePrice = (serviceId: number) => {
    const price = prices.find(p => p.service_id === serviceId);
    return price ? `${price.base_price} ${price.currency}` : null;
  };

  const pageTitle = `Услуги для ${brand.name} в Красноярске`;
  const pageDescription = `Полный список услуг по обслуживанию и ремонту ${brand.name} в Красноярске. ✓ Диагностика ✓ ТО ✓ Ремонт. Профессиональный сервис с гарантией. Запись онлайн!`;

  return (
    <>
      <Helmet>
        <title>{pageTitle} - {SITE_CONFIG.name}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_CONFIG.domain}/brands/${brandSlug}/services`} />
        <meta property="og:title" content={`${pageTitle} - ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`${SITE_CONFIG.domain}/brands/${brandSlug}/services`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={brand.logo_url || SITE_CONFIG.ogImage} />
      </Helmet>

      <Header setIsBookingOpen={setIsBookingOpen} />

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <section className="relative pt-32 pb-24 bg-gray-800 overflow-hidden">
        <img 
          src="https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/c3ce0034-a13b-4503-b9ee-3c454b1b44a5.jpg" 
          alt="Car service background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-[1]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Breadcrumbs 
            items={[
              { label: 'Главная', path: '/' },
              { label: 'Бренды', path: '/brands' },
              { label: brand.name, path: `/${brandSlug}` },
              { label: 'Услуги' }
            ]} 
            className="text-white/80"
          />

          <div className="mt-12 text-center text-white animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              {brand.logo_url && (
                <img 
                  src={brand.logo_url} 
                  alt={brand.name}
                  className="w-20 h-20 object-contain bg-white rounded-lg p-2"
                />
              )}
              <h1 className="text-5xl md:text-6xl font-bold">
                Услуги для {brand.name}
              </h1>
            </div>
            {brand.description && (
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                {brand.description}
              </p>
            )}
            <Badge variant="secondary" className="px-6 py-3 text-lg bg-white/20 text-white border-white/30">
              <Icon name="Wrench" size={20} className="mr-2" />
              {services.length} {services.length === 1 ? 'услуга' : services.length < 5 ? 'услуги' : 'услуг'}
            </Badge>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">

          <div className="max-w-5xl mx-auto mb-8">
            <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                      <Icon name="Wrench" size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Профессиональный сервис</h3>
                      <p className="text-sm text-muted-foreground">
                        Специализируемся на обслуживании {brand.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setIsBookingOpen(true)}>
                      <Icon name="Calendar" size={18} className="mr-2" />
                      Записаться
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={`tel:${SITE_CONFIG.phone}`}>
                        <Icon name="Phone" size={18} className="mr-2" />
                        Позвонить
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8">Доступные услуги</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {services.map((service, index) => {
              const price = getServicePrice(service.id);
              const serviceSlug = service.title.toLowerCase().replace(/\s+/g, '-');
              
              return (
                <Card 
                  key={service.id}
                  className="cursor-pointer hover:border-primary hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/services/${serviceSlug}`)}
                >
                  <CardHeader>
                    <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center mb-4">
                      <Icon name={service.icon} size={32} className="text-white" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Icon name="Clock" size={16} />
                        {service.duration}
                      </span>
                      {price && (
                        <Badge variant="outline" className="text-base font-bold">
                          {price}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-end text-primary text-sm font-medium">
                      Подробнее
                      <Icon name="ArrowRight" size={16} className="ml-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {services.length === 0 && (
            <Card className="text-center py-12 max-w-2xl mx-auto">
              <CardContent>
                <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Услуги уточняются</h3>
                <p className="text-muted-foreground mb-6">
                  Для данного бренда услуги в данный момент уточняются. Свяжитесь с нами для получения информации.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setIsBookingOpen(true)}>
                    Записаться на консультацию
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/${brandSlug}`}>
                      Выбрать модель
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}