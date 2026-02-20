import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_CONFIG } from '@/config/site';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

const BrandsPage = () => {
  const location = useLocation();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const canonicalUrl = `${SITE_CONFIG.domain}${location.pathname}`;

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f');
        const data = await response.json();
        
        // Убираем дубли по id
        const uniqueBrands = Array.from(
          new Map((data.brands || []).map((b: Brand) => [b.id, b])).values()
        );
        
        setBrands(uniqueBrands);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Ремонт и обслуживание всех марок авто - HEVSR Красноярск</title>
        <meta name="description" content={`Ремонт и обслуживание ${brands.length} популярных марок автомобилей в Красноярске. Профессиональный сервис, опытные мастера. Выберите свой бренд!`} />
        <meta name="keywords" content="ремонт марки авто Красноярск, обслуживание Toyota Красноярск, ремонт Lexus, Honda, Nissan, Kia, Hyundai, все марки автомобилей СТО" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Все бренды автомобилей - HEVSR" />
        <meta property="og:description" content={`Ремонт и обслуживание ${brands.length} популярных марок автомобилей в Красноярске. Профессиональный сервис для вашего авто.`} />
        <meta property="og:site_name" content="HEVSR" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Все бренды автомобилей - HEVSR" />
        <meta name="twitter:description" content={`Обслуживание ${brands.length} популярных марок автомобилей`} />
        <meta name="twitter:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
      </Helmet>
      <Header />
      
      <section className="relative pt-32 pb-24 bg-gray-800 overflow-hidden">
        <img 
          src="https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/c3ce0034-a13b-4503-b9ee-3c454b1b44a5.jpg" 
          alt="Car brands background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-[1]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Breadcrumbs items={[{ label: 'Все бренды' }]} className="text-white/80" />
          <div className="mt-12 text-center text-white animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Ремонт и обслуживание всех марок авто</h1>
            <p className="text-xl text-white/90">
              Мы обслуживаем {brands.length} популярных марок автомобилей в Красноярске
            </p>
          </div>
        </div>
      </section>
      
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-4">Поиск бренда</h2>
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Поиск по маркам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={20} />
                </button>
              )}
            </div>
          </div>
          {filteredBrands.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Бренды не найдены</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Популярные марки автомобилей</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {filteredBrands.map((brand, index) => (
              <Link
                key={brand.id}
                to={`/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <Card className="hover-scale cursor-pointer text-center p-6 bg-white h-40 flex flex-col items-center justify-center">
                  <img src={brand.logo} alt={brand.name} className="h-20 object-contain mb-3" loading="lazy" />
                  <p className="text-sm font-medium">{brand.name}</p>
                </Card>
              </Link>
              ))}
            </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrandsPage;