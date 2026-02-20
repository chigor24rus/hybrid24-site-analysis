import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  logo_url: string | null;
}

interface Price {
  id: number;
  service_id: number;
  brand_id: number;
  base_price: number;
  currency: string;
}

export default function BrandServiceDetailPage() {
  const { brandSlug, serviceSlug } = useParams<{ brandSlug: string; serviceSlug: string }>();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [price, setPrice] = useState<Price | null>(null);
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
        const foundBrand = allBrands.find(b => slugify(b.name) === brandSlug);

        if (!foundService || !foundBrand) {
          navigate('/404');
          return;
        }

        const foundPrice = allPrices.find(
          p => p.service_id === foundService.id && p.brand_id === foundBrand.id
        );

        setService(foundService);
        setBrand(foundBrand);
        setPrice(foundPrice || null);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandSlug, serviceSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!service || !brand) return null;

  const displayPrice = price
    ? `от ${price.base_price} ${price.currency}`
    : service.price;

  const pageTitle = `${service.title} для ${brand.name} в Красноярске`;
  const pageDescription = `${service.title} для автомобилей ${brand.name} в Красноярске. ${service.description}. Время работы: ${service.duration}. Цена: ${displayPrice}. Запись онлайн!`;

  return (
    <>
      <Helmet>
        <title>{pageTitle} - {SITE_CONFIG.name}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${service.title} ${brand.name} Красноярск, ${service.title} цена, автосервис ${brand.name}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_CONFIG.domain}/brands/${brandSlug}/services/${serviceSlug}`} />
        <meta property="og:title" content={`${pageTitle} - ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={pageDescription} />
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
              { label: 'Бренды', path: '/brands' },
              { label: brand.name, path: `/brands/${brandSlug}/services` },
              { label: service.title },
            ]}
            className="text-white/80"
          />

          <div className="mt-12 text-center text-white animate-fade-in">
            <div className="flex items-center justify-center gap-6 mb-6">
              {brand.logo_url && (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-16 object-contain bg-white/20 rounded-xl p-2"
                />
              )}
              <div className="w-24 h-24 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon name={service.icon} size={48} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {service.title} для {brand.name}
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {service.description}
            </p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Badge variant="secondary" className="px-6 py-3 text-lg bg-white/20 text-white border-white/30">
                <Icon name="Clock" size={20} className="mr-2" />
                {service.duration}
              </Badge>
              <Badge variant="secondary" className="px-6 py-3 text-lg bg-white/20 text-white border-white/30">
                {displayPrice}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="mb-8 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Описание услуги</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
              <div className="flex gap-4 pt-4 flex-wrap">
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

          <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="text-2xl">Стоимость для {brand.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  {brand.logo_url && (
                    <img src={brand.logo_url} alt={brand.name} className="h-10 object-contain" />
                  )}
                  <span className="text-lg font-semibold">{brand.name}</span>
                </div>
                <span className="text-2xl font-bold text-primary">{displayPrice}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                * Точная стоимость определяется после диагностики. Цены указаны за базовые работы.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </>
  );
}
