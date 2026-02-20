import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_CONFIG } from '@/config/site';
import { slugify } from '@/utils/slugify';

interface Brand {
  id: number;
  name: string;
}

interface ModelTag {
  id: number;
  name: string;
  color: string;
}

interface Model {
  id: number;
  brand_id: number;
  name: string;
  year_from: number | null;
  year_to: number | null;
  tags?: ModelTag[];
}

export default function BrandModelsPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, modelsRes] = await Promise.all([
          fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
          fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b'),
        ]);

        const [brandsData, modelsData] = await Promise.all([
          brandsRes.json(),
          modelsRes.json(),
        ]);

        const brands: Brand[] = brandsData.brands || [];
        const allModels: Model[] = modelsData.models || [];

        const foundBrand = brands.find(b => slugify(b.name) === brandSlug);

        if (!foundBrand) {
          navigate('/404');
          return;
        }

        const brandModels = allModels.filter(m => m.brand_id === foundBrand.id);

        setBrand(foundBrand);
        setModels(brandModels);
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

  const handleModelClick = (model: Model) => {
    navigate(`/${brandSlug}/${slugify(model.name)}`);
  };

  return (
    <>
      <Helmet>
        <title>Модели {brand.name} в Красноярске - {SITE_CONFIG.name}</title>
        <meta name="description" content={`Выберите модель ${brand.name} для просмотра доступных услуг и цен на обслуживание в Красноярске. ✓ Профессиональный ремонт ✓ Запись онлайн!`} />
        <meta name="keywords" content={`модели ${brand.name} Красноярск, ремонт ${brand.name} по моделям, обслуживание ${brand.name} цены, СТО ${brand.name} Красноярск`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_CONFIG.domain}/${brandSlug}`} />
        <meta property="og:title" content={`Модели ${brand.name} - ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={`Выберите модель ${brand.name} для просмотра доступных услуг и цен на обслуживание в ${SITE_CONFIG.address.locality}.`} />
        <meta property="og:url" content={`${SITE_CONFIG.domain}/${brandSlug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SITE_CONFIG.ogImage} />
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Модели ${brand.name} - ${SITE_CONFIG.name}`} />
        <meta name="twitter:description" content={`Выберите модель ${brand.name} для просмотра доступных услуг и цен на обслуживание.`} />
        <meta name="twitter:image" content={SITE_CONFIG.ogImage} />
      </Helmet>

      <Header setIsBookingOpen={setIsBookingOpen} />

      {/* Hero Section with Background */}
      <section className="relative pt-32 pb-24 bg-gray-800 overflow-hidden">
        <img 
          src="https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/c3ce0034-a13b-4503-b9ee-3c454b1b44a5.jpg" 
          alt="Car background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-[1]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Breadcrumbs 
            items={[
              { label: brand.name }
            ]} 
            className="text-white/80"
          />

          <div className="mt-12 text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Модели {brand.name} в Красноярске</h1>
            <p className="text-xl text-white/90">
              {models.length} {models.length === 1 ? 'модель' : models.length < 5 ? 'модели' : 'моделей'} доступно
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <Link to={`/brands/${brandSlug}/services`}>
              <Card className="cursor-pointer hover:border-primary hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                      <Icon name="Wrench" size={24} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-bold mb-1">Все услуги для {brand.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Полный список услуг с ценами для всех моделей
                      </p>
                    </div>
                    <Icon name="ArrowRight" size={20} className="text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8">Выберите модель</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {models.map((model, index) => (
              <Card 
                key={model.id}
                className="cursor-pointer hover:border-primary hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleModelClick(model)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                      <Icon name="Car" size={32} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">{model.name}</h3>
                  {model.year_from && (
                    <p className="text-sm text-muted-foreground text-center">
                      {model.year_from}{model.year_to ? `-${model.year_to}` : '+'} г.
                    </p>
                  )}
                  {model.tags && model.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                      {model.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-center text-primary text-sm font-medium">
                    Выбрать
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