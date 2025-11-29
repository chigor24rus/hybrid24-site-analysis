import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import Footer from '@/components/Footer';
import FloatingCallButton from '@/components/FloatingCallButton';

const promotions = [
  {
    id: 1,
    title: 'Сезонное ТО',
    description: 'Комплексная диагностика + замена масла со скидкой 25%',
    discount: '-25%',
    oldPrice: '6 000 ₽',
    newPrice: '4 500 ₽',
    validUntil: '31 декабря 2025',
    icon: 'Percent',
    details: 'Включает проверку всех систем автомобиля, замену масла и масляного фильтра, диагностику ходовой части'
  },
  {
    id: 2,
    title: 'Шиномонтаж 4+1',
    description: 'При покупке 4 шин — шиномонтаж в подарок',
    discount: 'Подарок',
    oldPrice: '8 000 ₽',
    newPrice: '6 000 ₽',
    validUntil: '15 января 2026',
    icon: 'Gift',
    details: 'Покупайте 4 шины и получите бесплатный шиномонтаж, балансировку и утилизацию старых шин'
  },
  {
    id: 3,
    title: 'Первое посещение',
    description: 'Скидка 15% на любые услуги для новых клиентов',
    discount: '-15%',
    oldPrice: '',
    newPrice: 'На все',
    validUntil: 'Постоянно',
    icon: 'Sparkles',
    details: 'Скидка действует на все виды услуг при первом визите в наш автосервис'
  },
  {
    id: 4,
    title: 'Диагностика в подарок',
    description: 'Бесплатная комплексная диагностика при ремонте',
    discount: 'Бесплатно',
    oldPrice: '2 000 ₽',
    newPrice: '0 ₽',
    validUntil: '31 марта 2026',
    icon: 'Search',
    details: 'При выполнении любого ремонта стоимостью от 5000 рублей — компьютерная диагностика бесплатно'
  },
  {
    id: 5,
    title: 'Замена тормозных колодок',
    description: 'Комплект колодок + работа со скидкой 20%',
    discount: '-20%',
    oldPrice: '12 000 ₽',
    newPrice: '9 600 ₽',
    validUntil: '28 февраля 2026',
    icon: 'Disc',
    details: 'Замена передних или задних тормозных колодок с проверкой тормозной системы'
  },
  {
    id: 6,
    title: 'Кондиционер — чистка + заправка',
    description: 'Полное обслуживание системы кондиционирования',
    discount: '-30%',
    oldPrice: '7 000 ₽',
    newPrice: '4 900 ₽',
    validUntil: '30 апреля 2026',
    icon: 'Wind',
    details: 'Антибактериальная обработка, заправка хладагентом, проверка герметичности системы'
  }
];

const PromotionsPage = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <section className="py-12 md:py-20 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <Badge className="mb-4 gradient-accent text-sm">Специальные предложения</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Акции АвтоТехЦентра</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Выгодные предложения на обслуживание и ремонт автомобилей
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {promotions.map((promo, index) => (
              <Card
                key={promo.id}
                className="hover-scale cursor-pointer animate-fade-in relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="gradient-accent text-lg px-3 py-1">{promo.discount}</Badge>
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Clock" size={16} />
                      <span>Действует до: {promo.validUntil}</span>
                    </div>
                    <Button className="w-full gradient-primary btn-glow mt-4" onClick={() => setIsBookingOpen(true)}>
                      Воспользоваться
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center animate-fade-in">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Условия акций</CardTitle>
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
        </div>
      </section>

      <Footer />
      <FloatingCallButton />
    </div>
  );
};

export default PromotionsPage;
