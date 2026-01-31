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
  onRefresh: () => void;
  hasMore: boolean;
  totalCount: number;
}

const PromotionsSection = ({ promotions, loading, onPromotionClick, onBookingClick, onRefresh, hasMore, totalCount }: PromotionsSectionProps) => {
  const formatValidUntil = (dateString: string) => {
    if (dateString === 'Постоянно') return 'Постоянно';
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const isEndingSoon = (dateString: string) => {
    if (dateString === 'Постоянно') return false;
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
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full">
              <Icon name="Tag" size={20} className="text-primary" />
              <span className="text-sm font-semibold text-primary">ВЫГОДНЫЕ ПРЕДЛОЖЕНИЯ • {totalCount} {totalCount === 1 ? 'АКЦИЯ' : totalCount < 5 ? 'АКЦИИ' : 'АКЦИЙ'}</span>
            </div>
          </div>
          <Link to="/promotions" className="group inline-block">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-3">
              Акции и спецпредложения
              <Icon name="ArrowRight" size={32} className="group-hover:translate-x-2 transition-transform" />
            </h2>
          </Link>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">Выгодные предложения для наших клиентов</p>
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
          <>
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
            {hasMore && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Button 
                  size="lg" 
                  variant="default" 
                  onClick={onRefresh}
                  className="group hover:scale-105 transition-all"
                >
                  <Icon name="RefreshCw" size={18} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Показать другие акции
                </Button>
                <Link to="/promotions">
                  <Button size="lg" variant="outline" className="group hover:bg-primary hover:text-primary-foreground transition-all">
                    Все акции
                    <Icon name="ArrowRight" size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PromotionsSection;