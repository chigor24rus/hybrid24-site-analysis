import HeroSection from './sections/HeroSection';
import BrandsSection from './sections/BrandsSection';
import ServicesSection from './sections/ServicesSection';
import PromotionsReviewsSection from './sections/PromotionsReviewsSection';
import ContentSection from './sections/ContentSection';
import ContactsSection from './sections/ContactsSection';

interface SectionsProps {
  setIsBookingOpen: (open: boolean) => void;
  setSelectedServices: (services: number[]) => void;
}

const Sections = ({ setIsBookingOpen, setSelectedServices }: SectionsProps) => {
  return (
    <>
      <HeroSection setIsBookingOpen={setIsBookingOpen} />
      <BrandsSection />
      <ServicesSection setIsBookingOpen={setIsBookingOpen} setSelectedServices={setSelectedServices} />
      <PromotionsReviewsSection setIsBookingOpen={setIsBookingOpen} />
      <ContentSection />
      <ContactsSection />
    </>
  );
};

export default Sections;