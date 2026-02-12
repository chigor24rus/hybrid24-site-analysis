import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import Footer from '@/components/Footer';
import PromotionTimer from '@/components/PromotionTimer';
import ShareButton from '@/components/ShareButton';
import PromotionSubscribe from '@/components/PromotionSubscribe';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_CONFIG } from '@/config/site';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  oldPrice: string;
  newPrice: string;
  validUntil: string;
  icon: string;
  details: string;
}

const PromotionsPage = () => {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const canonicalUrl = `${SITE_CONFIG.domain}${location.pathname}`;

  const isEndingSoon = (dateString: string) => {
    if (dateString === 'Постоянно') return false;
    try {
      const validUntil = new Date(dateString);
      const now = new Date();
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      return validUntil.getTime() - now.getTime() <= threeDaysInMs;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`https://functions.poehali.dev/f1aecbb9-bab7-4235-a31d-88082b99927d?t=${timestamp}`);
        const data = await response.json();
        if (data.promotions) {
          const now = new Date();
          const activePromotions = data.promotions.filter((promo: Promotion) => {
            if (promo.validUntil === 'Постоянно') return true;
            const validUntil = new Date(promo.validUntil);
            return validUntil > now;
          });
          setPromotions(activePromotions);
        } else {
          setPromotions([]);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPromotions();
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Акции автосервиса HEVSR в Красноярске | Скидки до 50%</title>
        <meta name="description" content="Выгодные акции на ремонт и обслуживание автомобилей в Красноярске. Скидки до 50% на диагностику, ТО, шиномонтаж. Запишитесь сейчас!" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Акции и специальные предложения - HEVSR" />
        <meta property="og:description" content="Выгодные акции на ремонт и обслуживание автомобилей в Красноярске. Скидки до 50% на диагностику, ТО и другие услуги." />
        <meta property="og:site_name" content="HEVSR" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Акции и специальные предложения - HEVSR" />
        <meta name="twitter:description" content="Выгодные акции на ремонт и обслуживание автомобилей в Красноярске." />
        <meta name="twitter:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
      </Helmet>
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <section className="relative pt-32 pb-24 bg-gray-800 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80" 
          alt="Promotions background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Breadcrumbs items={[{ label: 'Акции' }]} className="text-white/80" />
          <div className="mt-12 text-center text-white animate-fade-in">
            <Badge className="mb-6 px-6 py-3 text-lg bg-white/20 text-white border-white/30">
              <Icon name="Tag" size={20} className="mr-2" />
              Специальные предложения
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Акции автосервиса HEVSR</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Выгодные предложения на обслуживание и ремонт автомобилей в Красноярске
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">

          {loading ? (
            <div className="text-center py-12">
              <Icon name="Loader" className="animate-spin mx-auto" size={48} />
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Tag" className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Акций пока нет</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {promotions.map((promo, index) => (
              <Card
                key={promo.id}
                className="hover-scale cursor-pointer animate-fade-in relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                  <Badge className="gradient-accent text-lg px-3 py-1">{promo.discount}</Badge>
                  {isEndingSoon(promo.validUntil) && (
                    <Badge variant="destructive" className="text-sm px-2 py-1 animate-pulse">
                      <Icon name="AlertCircle" size={14} className="mr-1" />
                      Заканчивается
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <div className="w-14 h-14 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Icon name={promo.icon as any} size={28} className="text-white" />
                  </div>
                  <CardTitle className="text-2xl">{promo.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{promo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{promo.details}</p>
                    <div className="flex items-baseline gap-3">
                      {promo.oldPrice && (
                        <span className="text-muted-foreground line-through text-lg">{promo.oldPrice}</span>
                      )}
                      <span className="text-3xl font-bold text-primary">{promo.newPrice}</span>
                    </div>
                    <PromotionTimer validUntil={promo.validUntil} />
                    <div className="flex gap-2">
                      <Button className="flex-1 gradient-primary btn-glow" onClick={() => setIsBookingOpen(true)}>
                        Воспользоваться
                      </Button>
                    </div>
                    <ShareButton 
                      title={promo.title}
                      description={promo.description}
                      discount={promo.discount}
                    />
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}

          {!loading && promotions.length > 0 && (
            <>
              <div className="mt-16 animate-fade-in">
                <PromotionSubscribe />
              </div>

              <div className="mt-12 text-center animate-fade-in">
                <Card className="max-w-3xl mx-auto">
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Условия акций</h2>
                  </CardHeader>
                  <CardContent className="text-left">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>Акции не суммируются с другими скидками и спецпредложениями</span>
                      </li>
                      <li className="flex gap-2">
                        <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>Для получения скидки необходимо записаться заранее</span>
                      </li>
                      <li className="flex gap-2">
                        <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>Подробности акций уточняйте у администратора</span>
                      </li>
                      <li className="flex gap-2">
                        <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>Компания оставляет за собой право изменять условия акций</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />

      <ScrollToTopButton />
    </div>
  );
};

export default PromotionsPage;