import HeroSection from './sections/HeroSection';
import SpecialOfferBanner from './sections/SpecialOfferBanner';
import BrandsSection from './sections/BrandsSection';
import ServicesSection from './sections/ServicesSection';
import AwardsSection from './sections/AwardsSection';
import PromotionsReviewsSection from './sections/PromotionsReviewsSection';
import ContactsSection from './sections/ContactsSection';
import AdvantagesSection from './sections/AdvantagesSection';

interface SectionsProps {
  setIsBookingOpen: (open: boolean) => void;
  setIsDiagnosticsOpen: (open: boolean) => void;
  setSelectedServices: (services: number[]) => void;
  setBookingPromotion?: (promotion: string) => void;
}

const Sections = ({ setIsBookingOpen, setIsDiagnosticsOpen, setSelectedServices, setBookingPromotion }: SectionsProps) => {
  return (
    <>
      <HeroSection setIsBookingOpen={setIsBookingOpen} />
      <SpecialOfferBanner setIsDiagnosticsOpen={setIsDiagnosticsOpen} />
      <BrandsSection />
      <ServicesSection setIsBookingOpen={setIsBookingOpen} setSelectedServices={setSelectedServices} />
      {/* <AwardsSection /> */}
      <PromotionsReviewsSection setIsBookingOpen={setIsBookingOpen} setBookingPromotion={setBookingPromotion} />
      <ContactsSection />
      <AdvantagesSection />
    </>
  );
};

export default Sections;