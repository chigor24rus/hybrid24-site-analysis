import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface Price {
  id: number;
  brand_id: number;
  model_id: number | null;
  service_id: number;
  price: string;
}

interface ServiceDetailsCardsProps {
  brand: Brand;
  model: Model;
  service: Service;
  price: Price | null;
  finalPrice: string;
  onBookingClick: () => void;
}

export default function ServiceDetailsCards({ 
  brand, 
  model, 
  service, 
  price, 
  finalPrice, 
  onBookingClick 
}: ServiceDetailsCardsProps) {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6">Детали услуги</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center mb-4">
              <Icon name={service.icon} size={32} className="text-white" />
            </div>
            <CardTitle className="text-2xl">{service.title}</CardTitle>
            <CardDescription className="text-base mt-2">{service.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="Clock" size={18} />
              <span>Время работы: {service.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="Wrench" size={18} />
              <span>Профессиональное оборудование</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="ShieldCheck" size={18} />
              <span>Гарантия качества</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in border-primary/30" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-2xl">Стоимость услуги</CardTitle>
            <CardDescription>Для вашего автомобиля</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{finalPrice}</div>
              {price && price.price !== service.price && (
                <div className="text-sm text-muted-foreground">
                  Специальная цена для {brand.name} {model.name}
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="Check" size={16} className="text-green-500" />
                <span>Оригинальные запчасти</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Check" size={16} className="text-green-500" />
                <span>Опытные мастера</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Check" size={16} className="text-green-500" />
                <span>Гарантия на работы</span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full gradient-primary btn-glow"
              onClick={onBookingClick}
            >
              Записаться на услугу
              <Icon name="ArrowRight" className="ml-2" size={20} />
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
