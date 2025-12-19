import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface HeroSectionProps {
  setIsBookingOpen: (open: boolean) => void;
}

const HeroSection = ({ setIsBookingOpen }: HeroSectionProps) => {
  return (
    <section className="py-12 md:py-20 lg:py-32 relative overflow-hidden" aria-label="Главный баннер">
      <div 
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: 'url(https://cdn.poehali.dev/files/2025-12-13_14-19-48.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-2xl">
            <Badge className="mb-3 md:mb-4 gradient-accent text-xs md:text-sm">Быстро • Качественно • Надёжно</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-lg text-white whitespace-nowrap">
              Сертифицированная станция<br />технического обслуживания
            </h1>
            <div className="text-base md:text-lg lg:text-xl text-gray-200 mb-6 md:mb-8 drop-shadow-md space-y-1">
              <p className="whitespace-nowrap">Техническое обслуживание и ремонт автомобилей любой сложности.</p>
              <p className="whitespace-nowrap">Опытные мастера, современное оборудование, гарантия качества.</p>
            </div>
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
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;