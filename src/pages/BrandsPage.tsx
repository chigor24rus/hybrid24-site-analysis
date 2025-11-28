import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f');
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Все бренды</h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Мы обслуживаем {brands.length} популярных марок автомобилей
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {brands.map((brand, index) => (
              <Link
                key={brand.id}
                to={`/brand/${brand.slug}`}
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrandsPage;
