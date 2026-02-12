import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_CONFIG } from '@/config/site';

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  brand_id: number;
  name: string;
  year_from: number | null;
  year_to: number | null;
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
  brand_id: number;
  service_id: number;
  base_price: number;
  currency: string;
}

export default function ModelServicesPage() {
  const { brandSlug, modelSlug } = useParams<{ brandSlug: string; modelSlug: string }>();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, modelsRes, servicesRes, pricesRes] = await Promise.all([
          fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
          fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b'),
          fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc'),
          fetch('https://functions.poehali.dev/0cce410b-a4a1-4420-8df0-90d95a5055b7'),
        ]);

        const [brandsData, modelsData, servicesData, pricesData] = await Promise.all([
          brandsRes.json(),
          modelsRes.json(),
          servicesRes.json(),
          pricesRes.json(),
        ]);

        const brands: Brand[] = brandsData.brands || [];
        const models: Model[] = modelsData.models || [];
        const allServices: Service[] = servicesData.services || [];
        const allPrices: Price[] = pricesData.prices || [];

        const foundBrand = brands.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === brandSlug);
        const foundModel = models.find(m => m.name.toLowerCase().replace(/\s+/g, '-') === modelSlug && m.brand_id === foundBrand?.id);

        if (!foundBrand || !foundModel) {
          navigate('/404');
          return;
        }

        setBrand(foundBrand);
        setModel(foundModel);
        setServices(allServices);
        setPrices(allPrices);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandSlug, modelSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!brand || !model) {
    return null;
  }

  const handleServiceClick = (service: Service) => {
    const serviceSlug = service.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/${brandSlug}/${modelSlug}/${serviceSlug}`);
  };

  const getServicePrice = (service: Service) => {
    const price = prices.find(p => p.brand_id === brand.id && p.service_id === service.id);
    return price ? `${price.base_price} ${price.currency}` : service.price;
  };

  return (
    <>
      <Helmet>
        <title>Услуги для {brand.name} {model.name} в Красноярске - {SITE_CONFIG.name}</title>
        <meta name="description" content={`Полный список услуг по обслуживанию ${brand.name} ${model.name} в Красноярске. ✓ Диагностика ✓ Ремонт ✓ ТО. Запись онлайн!`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_CONFIG.domain}/${brandSlug}/${modelSlug}`} />
        <meta property="og:title" content={`Услуги для ${brand.name} ${model.name} - ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={`Полный список услуг по обслуживанию ${brand.name} ${model.name} в ${SITE_CONFIG.address.locality}. Диагностика, ремонт, техобслуживание с ценами.`} />
        <meta property="og:url" content={`${SITE_CONFIG.domain}/${brandSlug}/${modelSlug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SITE_CONFIG.ogImage} />
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Услуги для ${brand.name} ${model.name} - ${SITE_CONFIG.name}`} />
        <meta name="twitter:description" content={`Полный список услуг по обслуживанию ${brand.name} ${model.name}. Диагностика, ремонт, техобслуживание с ценами.`} />
        <meta name="twitter:image" content={SITE_CONFIG.ogImage} />
      </Helmet>

      <Header setIsBookingOpen={setIsBookingOpen} />

      {/* Hero Section with Background */}
      <section 
        className="relative pt-32 pb-24 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80)',
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <Breadcrumbs 
            items={[
              { label: 'Главная', path: '/' },
              { label: brand.name, path: `/${brandSlug}` },
              { label: model.name }
            ]} 
            className="text-white/80"
          />

          <div className="mt-12 text-center text-white">
            <Badge className="mb-6 text-sm px-4 py-1.5 bg-primary hover:bg-primary">{brand.name}</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{brand.name} {model.name} в Красноярске</h1>
            <p className="text-2xl text-white/90 mb-2">
              {model.year_from && (
                <span>
                  {model.year_from}{model.year_to ? `-${model.year_to}` : '+'} г.
                </span>
              )}
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Выберите услугу для просмотра подробной информации и записи
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Доступные услуги</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <Card 
                key={service.id}
                className="cursor-pointer hover:border-primary hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleServiceClick(service)}
              >
                <CardHeader>
                  <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Icon name={service.icon as any} size={32} className="text-white" />
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
                    <Badge variant="outline" className="text-base font-bold">
                      {getServicePrice(service)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-end text-primary text-sm font-medium">
                    Подробнее
                    <Icon name="ArrowRight" size={16} className="ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}