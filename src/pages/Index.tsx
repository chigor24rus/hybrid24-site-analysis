import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Helmet } from 'react-helmet';
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
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

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
        <script type="application/ld+json">
          {JSON.stringify(generateSchemaMarkup(reviews))}
        </script>
      </Helmet>
      
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <Sections setIsBookingOpen={setIsBookingOpen} />
      
      <Footer />
      
      <FloatingCallButton />
    </div>
  );
};

export default Index;