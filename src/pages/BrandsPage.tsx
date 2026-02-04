import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

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
  const canonicalUrl = `https://hybrid24.ru${location.pathname}`;

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
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: 'Все бренды' }]} />
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Все бренды</h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Мы обслуживаем {brands.length} популярных марок автомобилей
            </p>
          </div>
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
                  <img src={brand.logo} alt={brand.name} className="h-20 object-contain mb-3" />
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