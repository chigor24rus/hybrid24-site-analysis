import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export interface Review {
  id: number;
  customer_name: string;
  rating: number;
  review_text: string;
  service_name: string;
  review_date: string;
  is_visible: boolean;
  source: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
  loading: boolean;
  showViewAllButton?: boolean;
  showHeader?: boolean;
}

const ReviewsSection = ({ reviews, loading, showViewAllButton = false, showHeader = true }: ReviewsSectionProps) => {
  const navigate = useNavigate();

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${
              index < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section id="reviews-own" className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          {showHeader && (
            <div className="text-center mb-12">
              <Badge className="mb-4 gradient-primary text-sm">Отзывы наших клиентов</Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Проверенные отзывы
              </h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const visibleReviews = reviews.filter(review => review.is_visible);

  if (visibleReviews.length === 0) {
    return null;
  }

  return (
    <section id="reviews-own" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {showHeader && (
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4 gradient-primary text-sm">Отзывы наших клиентов</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Проверенные отзывы
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Реальные отзывы клиентов, которые доверили нам свои автомобили
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-8">
          {visibleReviews.map((review) => (
            <Card 
              key={review.id} 
              className="hover-scale transition-all duration-300 hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{review.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(review.review_date), 'd MMMM yyyy', { locale: ru })}
                    </p>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <Badge variant="secondary" className="mb-3">
                  {review.service_name}
                </Badge>

                <p className="text-muted-foreground leading-relaxed line-clamp-6">
                  {review.review_text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {showViewAllButton && (
          <div className="text-center">
            <Button 
              onClick={() => navigate('/reviews')}
              size="lg"
              className="gradient-primary hover-scale btn-glow"
            >
              Смотреть все отзывы
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;