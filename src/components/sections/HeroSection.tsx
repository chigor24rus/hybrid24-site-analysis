import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface HeroSectionProps {
  setIsBookingOpen: (open: boolean) => void;
}

const HeroSection = ({ setIsBookingOpen }: HeroSectionProps) => {
  return (
    <section 
      className="py-12 md:py-20 lg:py-32 bg-no-repeat bg-right relative hero-banner"
      style={{
        backgroundImage: 'url(https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/6197d68f-2afa-469a-bbfc-68154f818e8e.jpg)',
        backgroundSize: '50%',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/98 to-white/70 hero-gradient -z-10"></div>
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