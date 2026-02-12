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
  logo_url: string | null;
}

interface Price {
  id: number;
  service_id: number;
  brand_id: number;
  base_price: number;
  currency: string;
}

export default function ServiceDetailPage() {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, brandsRes, pricesRes] = await Promise.all([
          fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc'),
          fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
          fetch('https://functions.poehali.dev/0cce410b-a4a1-4420-8df0-90d95a5055b7'),
        ]);

        const [servicesData, brandsData, pricesData] = await Promise.all([
          servicesRes.json(),
          brandsRes.json(),
          pricesRes.json(),
        ]);

        const services: Service[] = servicesData.services || [];
        const allBrands: Brand[] = brandsData.brands || [];
        const allPrices: Price[] = pricesData.prices || [];

        const foundService = services.find(s => 
          s.title.toLowerCase().replace(/\s+/g, '-') === serviceSlug
        );

        if (!foundService) {
          navigate('/404');
          return;
        }

        const servicePrices = allPrices.filter(p => p.service_id === foundService.id);
        const brandsWithPrices = allBrands
          .map(brand => ({
            ...brand,
            slug: brand.name.toLowerCase().replace(/\s+/g, '-')
          }))
          .filter(brand => servicePrices.some(p => p.brand_id === brand.id))
          .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

        setService(foundService);
        setBrands(brandsWithPrices);
        setPrices(servicePrices);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const getBrandPrice = (brandId: number) => {
    const price = prices.find(p => p.brand_id === brandId);
    return price ? `${price.base_price} ${price.currency}` : service.price;
  };

  const pageTitle = `${service.title} в Красноярске - Цены по брендам`;
  const pageDescription = `${service.title} для различных марок автомобилей в Красноярске. ${service.description} Время работы: ${service.duration}. ✓ Профессиональный сервис ✓ Запись онлайн!`;

  return (
    <>
      <Helmet>
        <title>{pageTitle} - {SITE_CONFIG.name}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_CONFIG.domain}/services/${serviceSlug}`} />
        <meta property="og:title" content={`${pageTitle} - ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`${SITE_CONFIG.domain}/services/${serviceSlug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SITE_CONFIG.ogImage} />
      </Helmet>

      <Header setIsBookingOpen={setIsBookingOpen} />

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <section className="pt-32 pb-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <Breadcrumbs 
            items={[
              { label: 'Главная', path: '/' },
              { label: 'Услуги', path: '/services' },
              { label: service.title }
            ]} 
          />

          <div className="max-w-5xl mx-auto">
            <div className="mb-12 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-xl gradient-primary flex items-center justify-center mb-6 mx-auto">
                <Icon name={service.icon} size={40} className="text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title} в Красноярске</h1>
              <p className="text-xl text-muted-foreground mb-6">
                {service.description}
              </p>
              <div className="flex items-center justify-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={20} className="text-primary" />
                  <span>{service.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="DollarSign" size={20} className="text-primary" />
                  <span>от {service.price}</span>
                </div>
              </div>
            </div>

            <Card className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Описание услуги</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <div className="flex gap-4 pt-4">
                  <Button size="lg" onClick={() => setIsBookingOpen(true)}>
                    <Icon name="Calendar" size={18} className="mr-2" />
                    Записаться на услугу
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href={`tel:${SITE_CONFIG.phone}`}>
                      <Icon name="Phone" size={18} className="mr-2" />
                      {SITE_CONFIG.phone}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold mb-6">Цены по брендам</h2>
            <p className="text-muted-foreground mb-8 text-center">
              Выберите марку вашего автомобиля для просмотра точной цены
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand, index) => (
                <Card 
                  key={brand.id}
                  className="cursor-pointer hover:border-primary hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/brands/${brand.slug}/services`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">{brand.name}</h3>
                      {brand.logo_url && (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name} 
                          className="w-12 h-12 object-contain"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-base font-bold">
                        {getBrandPrice(brand.id)}
                      </Badge>
                      <div className="flex items-center text-primary text-sm font-medium">
                        Выбрать
                        <Icon name="ArrowRight" size={16} className="ml-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {brands.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">
                    Цены для данной услуги в данный момент уточняются
                  </p>
                  <Button className="mt-6" onClick={() => setIsBookingOpen(true)}>
                    Записаться на консультацию
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}