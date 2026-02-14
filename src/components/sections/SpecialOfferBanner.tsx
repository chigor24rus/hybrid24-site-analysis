import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface SpecialOfferBannerProps {
  setIsDiagnosticsOpen: (open: boolean) => void;
}

const SpecialOfferBanner = ({ setIsDiagnosticsOpen }: SpecialOfferBannerProps) => {
  return (
    <section className="py-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/10 via-background to-accent/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
          
          <div className="p-6 md:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Icon name="Gift" size={40} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-block mb-2 px-3 py-1 bg-primary/20 rounded-full">
                  <span className="text-xs md:text-sm font-semibold text-primary">СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ</span>
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Бесплатная диагностика по 100+ пунктам
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  Для новых клиентов: комплексный осмотр и диагностика ходовой части при заказе от 5 000 ₽
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle2" size={16} className="text-primary" />
                    <span>Общий технический осмотр</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle2" size={16} className="text-primary" />
                    <span>Диагностика ходовой части</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle2" size={16} className="text-primary" />
                    <span>Проверка по 100+ пунктам</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Button 
                  size="lg" 
                  className="gradient-primary btn-glow w-full sm:w-auto text-base md:text-lg"
                  onClick={() => setIsDiagnosticsOpen(true)}
                >
                  Записаться
                  <Icon name="ArrowRight" className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default SpecialOfferBanner;