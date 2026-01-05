import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import Sections from '@/components/Sections';
import Footer from '@/components/Footer';
import FloatingCallButton from '@/components/FloatingCallButton';
import { generateSchemaMarkup } from '@/utils/generateSchemaMarkup';

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
  const canonicalUrl = `https://hevsr.ru${location.pathname}`;

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
        <meta property="og:title" content="HEVSR - Сертифицированная СТО в Красноярске" />
        <meta property="og:description" content="Профессиональный ремонт, обслуживание автомобилей в Красноярске. Опытные мастера, современное оборудование. Звоните +7(923)0166750" />
        <meta property="og:site_name" content="HEVSR" />
        <meta property="og:locale" content="ru_RU" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HEVSR - Сертифицированная СТО в Красноярске" />
        <meta name="twitter:description" content="Профессиональный ремонт, обслуживание автомобилей в Красноярске. Опытные мастера, современное оборудование." />
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
      
      <FloatingCallButton />
    </div>
  );
};

export default Index;