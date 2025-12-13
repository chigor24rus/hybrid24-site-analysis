import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface HeroSectionProps {
  setIsBookingOpen: (open: boolean) => void;
}

const HeroSection = ({ setIsBookingOpen }: HeroSectionProps) => {
  return (
    <section 
      className="py-12 md:py-20 lg:py-32 relative hero-banner overflow-hidden"
      style={{
        backgroundImage: 'url(https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/a581a314-a72e-4485-a9ef-505e0a8ce052.jpg)',
        backgroundSize: '80%, 50%, 45%',
        backgroundPosition: 'right bottom, right center, right center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .hero-banner {
            background-size: 100% !important;
            background-position: center bottom !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-banner {
            background-size: 55% !important;
            background-position: right center !important;
          }
        }
        @media (min-width: 1025px) {
          .hero-banner {
            background-size: 45% !important;
            background-position: right center !important;
          }
        }
      `}</style>
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl">
          <Badge className="mb-3 md:mb-4 gradient-accent text-xs md:text-sm">Быстро • Качественно • Надёжно</Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            Сертифицированная станция
            <br />
            технического обслуживания
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl">
            Техническое обслуживание и ремонт автомобилей любой сложности. 
            Опытные мастера, современное оборудование, гарантия качества.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Button size="lg" className="gradient-primary btn-glow text-base md:text-lg w-full sm:w-auto" onClick={() => setIsBookingOpen(true)}>
              Записаться онлайн
              <Icon name="ArrowRight" className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="text-base md:text-lg w-full sm:w-auto" asChild>
              <a href="tel:+79230166750">
                <Icon name="Phone" className="mr-2" size={20} />
                +7 (923) 016-67-50
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;