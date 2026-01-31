import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

export interface Review {
  id: number | string;
  name: string;
  rating: number;
  date: string;
  text: string;
  service: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
  loading: boolean;
  expandedReviews: Set<number | string>;
  onToggleExpand: (reviewId: number | string) => void;
  onRefresh: () => void;
  truncateText: (text: string, maxLength?: number) => string;
}

const ReviewsSection = ({ 
  reviews, 
  loading, 
  expandedReviews, 
  onToggleExpand, 
  onRefresh,
  truncateText 
}: ReviewsSectionProps) => {
  return (
    <section id="reviews" className="py-12 md:py-16 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full">
              <Icon name="Star" size={20} className="text-primary fill-primary" />
              <span className="text-sm font-semibold text-primary">ДОВЕРИЕ КЛИЕНТОВ</span>
            </div>
          </div>
          <Link to="/reviews" className="group inline-block">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-3">
              Отзывы клиентов
              <Icon name="ArrowRight" size={32} className="group-hover:translate-x-2 transition-transform" />
            </h2>
          </Link>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Реальные истории от наших клиентов — качество, которому доверяют
          </p>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader" className="animate-spin mx-auto text-primary" size={48} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-card/50 flex items-center justify-center">
              <Icon name="MessageSquare" className="text-muted-foreground" size={48} />
            </div>
            <p className="text-muted-foreground text-lg">Отзывов пока нет</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reviews.map((review, index) => {
              const isExpanded = expandedReviews.has(review.id);
              const shouldTruncate = review.text.length > 150;
              
              return (
                <Card
                  key={review.id}
                  className="hover-scale animate-fade-in border-2 hover:border-primary/50 transition-all duration-300 bg-card/80 backdrop-blur"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1 flex items-center gap-2">
                          {review.name}
                          <Icon name="BadgeCheck" size={16} className="text-primary" />
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex gap-0.5 bg-yellow-500/10 p-1.5 rounded-lg">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          name="Star"
                          size={14}
                          className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}
                        />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Icon name="Quote" size={24} className="absolute -top-1 -left-1 text-primary/20" />
                      <p className="text-muted-foreground text-sm leading-relaxed pl-5">
                        {isExpanded || !shouldTruncate ? review.text : truncateText(review.text)}
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={() => onToggleExpand(review.id)}
                          className="text-primary text-sm font-medium mt-2 hover:underline inline-flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              Свернуть
                              <Icon name="ChevronUp" size={14} />
                            </>
                          ) : (
                            <>
                              Ещё
                              <Icon name="ChevronDown" size={14} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Icon name="Calendar" size={12} />
                      <span>{review.date}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Button 
                size="lg" 
                variant="default" 
                onClick={onRefresh}
                className="group hover:scale-105 transition-all"
              >
                <Icon name="RefreshCw" size={18} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Показать другие отзывы
              </Button>
              <Link to="/reviews">
                <Button size="lg" variant="outline" className="group hover:bg-primary hover:text-primary-foreground transition-all">
                  Все отзывы
                  <Icon name="ArrowRight" size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
