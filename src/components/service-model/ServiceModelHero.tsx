import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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

interface ServiceModelHeroProps {
  brand: Brand;
  model: Model;
  service: Service;
  finalPrice: string;
}

export default function ServiceModelHero({ brand, model, service, finalPrice }: ServiceModelHeroProps) {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-24 bg-gray-800 overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80" 
        alt="Car service background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:text-white hover:bg-white/10">
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад
          </Button>
        </div>

        <div className="mt-12 text-center text-white animate-fade-in">
          <div className="w-24 h-24 rounded-xl bg-white/20 flex items-center justify-center mb-6 mx-auto">
            <Icon name={service.icon} size={48} className="text-white" />
          </div>
          <Badge className="mb-6 px-6 py-3 text-lg bg-white/20 text-white border-white/30">{service.title}</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">{service.title} {brand.name} {model.name}</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {brand.name} {model.name}
            {model.year_from && (
              <span className="ml-2">
                ({model.year_from}{model.year_to ? `-${model.year_to}` : '+'} г.)
              </span>
            )}
          </p>
          <div className="flex items-center justify-center gap-8 text-lg">
            <Badge variant="secondary" className="px-6 py-3 text-lg bg-white/20 text-white border-white/30">
              <Icon name="Clock" size={20} className="mr-2" />
              {service.duration}
            </Badge>
            <Badge variant="secondary" className="px-6 py-3 text-lg bg-white/20 text-white border-white/30">
              {finalPrice}
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
