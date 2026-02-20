import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import FreeDiagnosticsDialog from '@/components/FreeDiagnosticsDialog';
import Sections from '@/components/Sections';
import Footer from '@/components/Footer';
import { generateSchemaMarkup, generateYandexSchema } from '@/utils/generateSchemaMarkup';
import { SITE_CONFIG } from '@/config/site';

const Index = () => {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const canonicalUrl = `${SITE_CONFIG.domain}${location.pathname}`;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/fe3a5b5b-90b1-406c-82f5-e74bbf2ebdd9');
        const data = await response.json();
        if (response.ok && data.reviews) {
          const formattedReviews = data.reviews
            .filter((r: any) => r.is_visible)
            .map((r: any) => ({
              id: r.id,
              name: r.customer_name,
              rating: r.rating,
              date: r.review_date,
              text: r.review_text,
              service: r.service_name
            }));
          setReviews(formattedReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews for schema:', error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Автосервис в Красноярске | {SITE_CONFIG.name}</title>
        <meta name="description" content={`Ремонт гибридов и авто в Красноярске. Опытные мастера, гарантия. Запись: ${SITE_CONFIG.phone}`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${SITE_CONFIG.name} - Сертифицированная СТО в Красноярске`} />
        <meta property="og:description" content={`Профессиональный ремонт, обслуживание автомобилей в Красноярске. Опытные мастера, современное оборудование. Звоните ${SITE_CONFIG.phone}`} />
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content={SITE_CONFIG.ogImage} />
        <meta property="og:image:width" content={SITE_CONFIG.ogImageWidth} />
        <meta property="og:image:height" content={SITE_CONFIG.ogImageHeight} />
        <meta property="og:image:alt" content={`${SITE_CONFIG.name} - Профессиональный автосервис в Красноярске`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${SITE_CONFIG.name} - Сертифицированная СТО в Красноярске`} />
        <meta name="twitter:description" content={`Сертифицированная СТО в Красноярске. Ремонт гибридов, ТО, диагностика. Запись: ${SITE_CONFIG.phone}`} />
        <meta name="twitter:image" content={SITE_CONFIG.ogImage} />
        <script type="application/ld+json">
          {JSON.stringify(generateSchemaMarkup(reviews))}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(generateYandexSchema(reviews))}
        </script>
      </Helmet>
      
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} initialSelectedServices={selectedServices} />
      </Dialog>

      <Dialog open={isDiagnosticsOpen} onOpenChange={setIsDiagnosticsOpen}>
        <FreeDiagnosticsDialog setIsOpen={setIsDiagnosticsOpen} />
      </Dialog>

      <Sections setIsBookingOpen={setIsBookingOpen} setIsDiagnosticsOpen={setIsDiagnosticsOpen} setSelectedServices={setSelectedServices} />
      
      <Footer />
    </div>
  );
};

export default Index;