import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  oldPrice: string;
  newPrice: string;
  validUntil: string;
  icon: string;
  details?: string;
}

interface PromotionsSectionProps {
  promotions: Promotion[];
  loading: boolean;
  onPromotionClick: (promotion: Promotion) => void;
  onBookingClick: () => void;
}

const PromotionsSection = ({ promotions, loading, onPromotionClick, onBookingClick }: PromotionsSectionProps) => {
  const formatValidUntil = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const isEndingSoon = (dateString: string) => {
    try {
      const validUntil = new Date(dateString);
      const now = new Date();
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      return validUntil.getTime() - now.getTime() <= threeDaysInMs;
    } catch {
      return false;
    }
  };

  return (
    <section id="promotions" className="py-12 md:py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <Link to="/promotions" className="group inline-block">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-3">
              Акции и спецпредложения
              <Icon name="ArrowRight" size={32} className="group-hover:translate-x-2 transition-transform" />
            </h2>
          </Link>
          <p className="text-muted-foreground text-base md:text-lg">Выгодные предложения для наших клиентов</p>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader" className="animate-spin mx-auto" size={48} />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Tag" className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">Акций пока нет</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {promotions.map((promo, index) => (
            <Card
              key={promo.id}
              className="hover-scale cursor-pointer animate-fade-in relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => onPromotionClick(promo)}
            >
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                <Badge className="gradient-accent text-lg px-3 py-1">{promo.discount}</Badge>
                {isEndingSoon(promo.validUntil) && (
                  <Badge variant="destructive" className="text-sm px-2 py-1 animate-pulse">
                    <Icon name="AlertCircle" size={14} className="mr-1" />
                    Заканчивается
                  </Badge>
                )}
              </div>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Icon name={promo.icon as any} size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl">{promo.title}</CardTitle>
                <CardDescription className="text-base mt-2">{promo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    {promo.oldPrice && (
                      <span className="text-muted-foreground line-through text-lg">{promo.oldPrice}</span>
                    )}
                    <span className="text-3xl font-bold text-primary">{promo.newPrice}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Clock" size={14} />
                    <span>Действует до: {formatValidUntil(promo.validUntil)}</span>
                  </div>
                  <Button 
                    className="w-full gradient-primary btn-glow mt-4" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick();
                    }}
                  >
                    Воспользоваться
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PromotionsSection;