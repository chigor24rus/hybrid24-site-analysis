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
import { slugify } from '@/utils/slugify';

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

        const foundService = services.find(s => slugify(s.title) === serviceSlug);

        if (!foundService) {
          navigate('/404');
          return;
        }

        const servicePrices = allPrices.filter(p => p.service_id === foundService.id);
        const brandsWithPrices = allBrands
          .map(brand => ({
            ...brand,
            slug: slugify(brand.name)
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
        <meta name="keywords" content={`${service.title} Красноярск, цена ${service.title}, ${service.title} автосервис, стоимость ${service.title} авто`} />
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

      <section className="relative pt-32 pb-24 bg-gray-800 overflow-hidden">
        <img 
          src="https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/80977afe-6a7d-4b27-803c-d96416871914.jpg" 
          alt="Auto service background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-[1]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Breadcrumbs 
            items={[
              { label: 'Услуги', path: '/services' },
              { label: service.title }
            ]} 
            className="text-white/80"
          />

          <div className="mt-12 text-center text-white animate-fade-in">
            <div className="w-24 h-24 rounded-xl bg-white/20 flex items-center justify-center mb-6 mx-auto">
              <Icon name={service.icon} size={48} className="text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{service.title} в Красноярске</h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {service.description}
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <Badge variant="secondary" className="px-6 py-3 text-lg bg-white/20 text-white border-white/30">
                <Icon name="Clock" size={20} className="mr-2" />
                {service.duration}
              </Badge>
              <Badge variant="secondary" className="px-6 py-3 text-lg bg-white/20 text-white border-white/30">
                {service.price}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">

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
                  onClick={() => navigate(`/brands/${brand.slug}/services/${serviceSlug}`)}
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