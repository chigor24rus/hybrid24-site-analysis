import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import Sections from '@/components/Sections';
import Footer from '@/components/Footer';
import { generateSchemaMarkup } from '@/utils/generateSchemaMarkup';
import { SITE_CONFIG } from '@/config/site';

interface Review {
  id: number | string;
  name: string;
  rating: number;
  date: string;
  text: string;
  service: string;
}

const Index = () => {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const canonicalUrl = `${SITE_CONFIG.domain}${location.pathname}`;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/24530517-9b0c-4a6b-957e-ac05025d52ce');
        const data = await response.json();
        if (response.ok && data.reviews) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
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
        <meta name="twitter:description" content="Профессиональный ремонт, обслуживание автомобилей в Красноярске. Опытные мастера, современное оборудование." />
        <meta name="twitter:image" content={SITE_CONFIG.ogImage} />
        <script type="application/ld+json">
          {JSON.stringify(generateSchemaMarkup(reviews))}
        </script>
      </Helmet>
      
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} initialSelectedServices={selectedServices} />
      </Dialog>

      <Sections setIsBookingOpen={setIsBookingOpen} setSelectedServices={setSelectedServices} />
      
      <Footer />
    </div>
  );
};

export default Index;