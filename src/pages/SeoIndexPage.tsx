import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/config/site';

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  brand_id: number;
  brand_name: string;
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
  model_id: number | null;
  service_id: number;
  price: string;
}

interface SeoPage {
  brand: Brand;
  model: Model;
  service: Service;
  price: Price | null;
  url: string;
}

const SeoIndexPage = () => {
  const [loading, setLoading] = useState(true);
  const [seoPages, setSeoPages] = useState<SeoPage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

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
        const services: Service[] = servicesData.services || [];
        const prices: Price[] = pricesData.prices || [];

        const pages: SeoPage[] = [];

        brands.forEach(brand => {
          const brandModels = models.filter(m => m.brand_id === brand.id);
          
          brandModels.forEach(model => {
            services.forEach(service => {
              const price = prices.find(p => 
                p.brand_id === brand.id && 
                p.service_id === service.id
              );

              const brandSlug = brand.name.toLowerCase().replace(/\s+/g, '-');
              const modelSlug = model.name.toLowerCase().replace(/\s+/g, '-');
              const serviceSlug = service.title.toLowerCase().replace(/\s+/g, '-');
              
              pages.push({
                brand,
                model,
                service,
                price: price || null,
                url: `/${brandSlug}/${modelSlug}/${serviceSlug}`,
              });
            });
          });
        });

        setSeoPages(pages);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPages = seoPages.filter(page => {
    const searchLower = searchTerm.toLowerCase();
    return (
      page.brand.name.toLowerCase().includes(searchLower) ||
      page.model.name.toLowerCase().includes(searchLower) ||
      page.service.title.toLowerCase().includes(searchLower)
    );
  });

  const groupedPages = filteredPages.reduce((acc, page) => {
    const key = `${page.brand.name} ${page.model.name}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(page);
    return acc;
  }, {} as Record<string, SeoPage[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Все услуги по маркам и моделям - {SITE_CONFIG.name}</title>
        <meta name="description" content={`Полный каталог услуг автосервиса для всех марок и моделей автомобилей в ${SITE_CONFIG.address.locality}. Узнайте точную стоимость обслуживания вашего автомобиля.`} />
        <meta name="keywords" content="каталог услуг автосервис, все марки авто Красноярск, стоимость ремонта авто, цены на обслуживание автомобилей, СТО HEVSR каталог" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_CONFIG.domain}/services-index`} />
        <meta property="og:title" content={`Все услуги по маркам и моделям - ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={`Полный каталог услуг автосервиса для всех марок и моделей автомобилей в ${SITE_CONFIG.address.locality}. Узнайте точную стоимость обслуживания.`} />
        <meta property="og:url" content={`${SITE_CONFIG.domain}/services-index`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SITE_CONFIG.ogImage} />
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Все услуги по маркам и моделям - ${SITE_CONFIG.name}`} />
        <meta name="twitter:description" content="Полный каталог услуг автосервиса для всех марок и моделей автомобилей." />
        <meta name="twitter:image" content={SITE_CONFIG.ogImage} />
      </Helmet>

      <Header setIsBookingOpen={setIsBookingOpen} />

      <section className="pt-32 pb-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Каталог услуг по маркам</h1>
            <p className="text-xl text-muted-foreground mb-8">
              {seoPages.length} услуг для различных марок и моделей
            </p>

            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  type="text"
                  placeholder="Поиск по марке, модели или услуге..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-6 text-lg"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedPages).map(([vehicleKey, pages], index) => (
              <Card key={vehicleKey} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Icon name="Car" size={24} className="text-primary" />
                    {vehicleKey}
                  </CardTitle>
                  <CardDescription>
                    {pages[0].model.year_from && (
                      <span>
                        {pages[0].model.year_from}{pages[0].model.year_to ? `-${pages[0].model.year_to}` : '+'} г.
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pages.map((page) => (
                      <Link 
                        key={page.url} 
                        to={page.url}
                        className="group"
                      >
                        <div className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Icon name={page.service.icon as any} size={18} className="text-primary" />
                              <span className="font-semibold group-hover:text-primary transition-colors">
                                {page.service.title}
                              </span>
                            </div>
                            <Icon name="ExternalLink" size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{page.service.duration}</span>
                            <Badge variant="outline">{page.price?.price || page.service.price}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPages.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Ничего не найдено. Попробуйте изменить запрос.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default SeoIndexPage;