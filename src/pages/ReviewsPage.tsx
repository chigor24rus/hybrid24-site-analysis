import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import Footer from '@/components/Footer';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import ReviewsSection, { Review } from '@/components/sections/home/ReviewsSection';
import { generateSchemaMarkup, generateYandexSchema } from '@/utils/generateSchemaMarkup';

const ReviewsPage = () => {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const canonicalUrl = `https://hybrid24.ru${location.pathname}`;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/fe3a5b5b-90b1-406c-82f5-e74bbf2ebdd9');
        const data = await response.json();
        if (response.ok && data.reviews) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  const schemaReviews = reviews
    .filter(r => r.is_visible)
    .map(r => ({
      id: r.id,
      name: r.customer_name,
      rating: r.rating,
      date: r.review_date,
      text: r.review_text,
      service: r.service_name
    }));

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Отзывы о HEVSR - Реальные отзывы клиентов | Красноярск</title>
        <meta name="description" content="Читайте реальные отзывы клиентов автосервиса HEVSR в Красноярске. Оцените качество нашей работы!" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Отзывы клиентов - HEVSR" />
        <meta property="og:description" content="Реальные отзывы о нашем автосервисе в Красноярске" />
        <meta property="og:site_name" content="HEVSR" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Отзывы клиентов - HEVSR" />
        <meta name="twitter:description" content="Реальные отзывы клиентов автосервиса" />
        <meta name="twitter:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
        <script type="application/ld+json">
          {JSON.stringify(generateSchemaMarkup(schemaReviews))}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(generateYandexSchema(schemaReviews))}
        </script>
      </Helmet>
      
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <section className="py-12 md:py-16 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: 'Отзывы' }]} />
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <Badge className="mb-4 gradient-accent text-sm">Все отзывы</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Отзывы клиентов HEVSR в Красноярске</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Реальные и проверенные отзывы о качестве нашего обслуживания
            </p>
          </div>
        </div>
      </section>

      <ReviewsSection reviews={reviews} loading={loadingReviews} showViewAllButton={false} showHeader={false} />
      
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default ReviewsPage;