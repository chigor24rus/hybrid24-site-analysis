import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

const BrandsSection = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
      <div className="py-12 md:py-16 text-center">
        <Icon name="Loader" className="animate-spin mx-auto" size={48} />
      </div>
    );
  }

  return (
    <section id="brands" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <Link to="/brands" className="group inline-block">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-3">
              Бренды, с которыми мы работаем
              <Icon name="ArrowRight" size={32} className="group-hover:translate-x-2 transition-transform" />
            </h2>
          </Link>
          <p className="text-muted-foreground text-base md:text-lg">Обслуживаем все популярные марки автомобилей</p>
        </div>
        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
            aria-label="Прокрутить влево"
          >
            <Icon name="ChevronLeft" size={24} className="text-primary" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
            aria-label="Прокрутить вправо"
          >
            <Icon name="ChevronRight" size={24} className="text-primary" />
          </button>
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
          <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth">
            {brands.map((brand, index) => (
              <Link
                key={`brand-${brand.id}`}
                to={`/brand/${brand.slug}`}
                className="flex-shrink-0"
              >
                <Card className="hover-scale cursor-pointer text-center p-6 bg-white w-32 h-32 flex flex-col items-center justify-center">
                  <img src={brand.logo} alt={brand.name} className="h-16 object-contain mb-2" />
                  <p className="text-xs font-medium">{brand.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
