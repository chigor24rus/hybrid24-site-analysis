import HeroSection from './sections/HeroSection';
import SpecialOfferBanner from './sections/SpecialOfferBanner';
import BrandsSection from './sections/BrandsSection';
import ServicesSection from './sections/ServicesSection';
import PromotionsReviewsSection from './sections/PromotionsReviewsSection';
import ContactsSection from './sections/ContactsSection';

interface SectionsProps {
  setIsBookingOpen: (open: boolean) => void;
  setIsDiagnosticsOpen: (open: boolean) => void;
  setSelectedServices: (services: number[]) => void;
}

const Sections = ({ setIsBookingOpen, setIsDiagnosticsOpen, setSelectedServices }: SectionsProps) => {
  return (
    <>
      <HeroSection setIsBookingOpen={setIsBookingOpen} />
      <SpecialOfferBanner setIsDiagnosticsOpen={setIsDiagnosticsOpen} />
      <BrandsSection />
      <ServicesSection setIsBookingOpen={setIsBookingOpen} setSelectedServices={setSelectedServices} />
      <PromotionsReviewsSection setIsBookingOpen={setIsBookingOpen} />
      <ContactsSection />
    </>
  );
};

export default Sections;