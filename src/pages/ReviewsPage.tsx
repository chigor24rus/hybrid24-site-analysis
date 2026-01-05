import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import Footer from '@/components/Footer';
import FloatingCallButton from '@/components/FloatingCallButton';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { generateSchemaMarkup } from '@/utils/generateSchemaMarkup';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Review {
  id: number | string;
  name: string;
  rating: number;
  date: string;
  text: string;
  service: string;
}

const ReviewsPage = () => {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const canonicalUrl = `https://hevsr.ru${location.pathname}`;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/24530517-9b0c-4a6b-957e-ac05025d52ce');
        const data = await response.json();
        
        if (response.ok && data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen">
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Отзывы клиентов - HEVSR" />
        <meta property="og:description" content={`${reviews.length} отзывов о нашем автосервисе в Красноярске. Средняя оценка: ${averageRating} из 5.0`} />
        <meta property="og:site_name" content="HEVSR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Отзывы клиентов - HEVSR" />
        <meta name="twitter:description" content={`${reviews.length} отзывов клиентов. Средняя оценка: ${averageRating}`} />
        <script type="application/ld+json">
          {JSON.stringify(generateSchemaMarkup(reviews))}
        </script>
      </Helmet>
      
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <section className="py-12 md:py-20 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: 'Отзывы' }]} />
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <Badge className="mb-4 gradient-accent text-sm">Отзывы клиентов</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Что говорят о нас</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Мнения наших клиентов о качестве обслуживания
            </p>
          </div>

          {!loading && reviews.length > 0 && (
            <div className="max-w-4xl mx-auto mb-12 animate-fade-in">
              <Card className="text-center">
                <CardContent className="py-8">
                  <div className="flex items-center justify-center gap-8 flex-wrap">
                    <div>
                      <div className="text-5xl font-bold text-primary mb-2">{averageRating}</div>
                      <div className="flex gap-1 justify-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon 
                            key={i} 
                            name="Star" 
                            size={24} 
                            className={i < Math.round(Number(averageRating)) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">Средняя оценка</p>
                    </div>
                    <div className="h-12 w-px bg-border"></div>
                    <div>
                      <div className="text-5xl font-bold text-primary mb-2">{reviews.length}</div>
                      <p className="text-sm text-muted-foreground">Всего отзывов</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <Icon name="Loader" className="animate-spin mx-auto mb-4" size={48} />
              <p className="text-muted-foreground">Загрузка отзывов...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20">
              <Icon name="MessageSquare" className="mx-auto mb-4 text-muted-foreground" size={64} />
              <h3 className="text-2xl font-bold mb-2">Отзывов пока нет</h3>
              <p className="text-muted-foreground mb-6">Станьте первым, кто оставит отзыв о нашем сервисе</p>
              <Button className="gradient-primary btn-glow" onClick={() => setIsBookingOpen(true)}>
                Записаться на обслуживание
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
                {reviews.map((review, index) => (
                  <Card
                    key={review.id}
                    className="hover-scale animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{review.name}</CardTitle>
                          <CardDescription className="mt-1">{review.date}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Icon key={i} name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3 leading-relaxed">{review.text}</p>
                      <Badge variant="outline" className="mt-2">
                        <Icon name="CheckCircle" size={14} className="mr-1" />
                        {review.service}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-16 text-center animate-fade-in">
                <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Хотите оставить отзыв?</h2>
                    <CardDescription className="text-base">
                      Мы ценим мнение каждого клиента и постоянно работаем над улучшением качества обслуживания
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="gradient-primary btn-glow" size="lg" onClick={() => setIsBookingOpen(true)}>
                      <Icon name="MessageSquare" className="mr-2" size={20} />
                      Записаться и оставить отзыв
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
      <FloatingCallButton />
      <ScrollToTopButton />
    </div>
  );
};

export default ReviewsPage;