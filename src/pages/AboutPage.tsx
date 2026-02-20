import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/sections/ContentSection';
import { SITE_CONFIG } from '@/config/site';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import BookingDialog from '@/components/BookingDialog';

const AboutPage = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const canonicalUrl = `${SITE_CONFIG.domain}/about`;

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>О нас - {SITE_CONFIG.name}</title>
        <meta name="description" content="О компании HEVSR - профессиональный автосервис в Красноярске. Наша команда, опыт работы, современное оборудование и гарантии качества." />
        <meta name="keywords" content="о нас HEVSR, команда автосервис Красноярск, история компании СТО, мастера по ремонту авто, сертифицированный автосервис" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`О нас - ${SITE_CONFIG.name}`} />
        <meta property="og:description" content="О компании HEVSR - профессиональный автосервис в Красноярске. Наша команда, опыт работы, современное оборудование и гарантии качества." />
      </Helmet>
      
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} initialSelectedServices={[]} />
      </Dialog>

      <ContentSection />
      
      <Footer />
    </div>
  );
};

export default AboutPage;