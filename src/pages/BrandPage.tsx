import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingDialog from '@/components/BookingDialog';
import { useState } from 'react';

const brandData: Record<string, {
  name: string;
  description: string;
  logo: string;
  services: Array<{
    title: string;
    description: string;
    price: string;
    icon: string;
  }>;
  features: string[];
}> = {
  toyota: {
    name: 'Toyota',
    description: 'Специализированное обслуживание автомобилей Toyota. Оригинальные запчасти, сертифицированные мастера.',
    logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/4e08abc9-6dc7-4175-88e7-4506631ccebe.jpg',
    services: [
      { title: 'Техническое обслуживание', description: 'Регулярное ТО по регламенту производителя', price: 'от 3 500 ₽', icon: 'Settings' },
      { title: 'Диагностика двигателя', description: 'Компьютерная диагностика всех систем', price: 'от 1 500 ₽', icon: 'Search' },
      { title: 'Замена масла', description: 'Оригинальное масло Toyota', price: 'от 2 500 ₽', icon: 'Droplet' },
      { title: 'Ремонт гибридных систем', description: 'Обслуживание гибридных моделей', price: 'от 8 000 ₽', icon: 'Zap' },
    ],
    features: ['Оригинальные запчасти Toyota', 'Гарантия на все работы', 'Специализированное оборудование', 'Обученные мастера']
  },
  bmw: {
    name: 'BMW',
    description: 'Профессиональный сервис BMW. Немецкое качество обслуживания.',
    logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/4de578b1-4cb2-4791-8ab0-306463ecef8f.jpg',
    services: [
      { title: 'Техническое обслуживание', description: 'ТО по стандартам BMW', price: 'от 5 000 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Диагностика всех систем BMW', price: 'от 2 000 ₽', icon: 'Search' },
      { title: 'Ремонт подвески', description: 'Замена амортизаторов, стоек', price: 'от 6 000 ₽', icon: 'Wrench' },
      { title: 'Обслуживание тормозов', description: 'Замена колодок, дисков', price: 'от 4 500 ₽', icon: 'AlertCircle' },
    ],
    features: ['Оригинальные запчасти BMW', 'Специализированная диагностика', 'Сертифицированные мастера', 'Гарантия качества']
  },
  mercedes: {
    name: 'Mercedes-Benz',
    description: 'Премиальное обслуживание Mercedes-Benz. Высочайшие стандарты качества.',
    logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/5fcb3172-9037-4e6e-8252-979e327dd734.jpg',
    services: [
      { title: 'Техническое обслуживание', description: 'ТО премиум-класса', price: 'от 5 500 ₽', icon: 'Settings' },
      { title: 'Диагностика Star Diagnosis', description: 'Фирменная диагностика Mercedes', price: 'от 2 500 ₽', icon: 'Search' },
      { title: 'Обслуживание АКПП', description: 'Диагностика и ремонт коробки передач', price: 'от 8 000 ₽', icon: 'Cog' },
      { title: 'Кузовной ремонт', description: 'Восстановление кузова', price: 'от 10 000 ₽', icon: 'Car' },
    ],
    features: ['Оригинальные запчасти Mercedes', 'Премиальное обслуживание', 'Современное оборудование', 'Полная гарантия']
  },
  audi: {
    name: 'Audi',
    description: 'Специализированное обслуживание Audi. Технологии будущего сегодня.',
    logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/ba02db5f-9801-4420-8836-39f52c1eb11f.jpg',
    services: [
      { title: 'Техническое обслуживание', description: 'ТО по регламенту Audi', price: 'от 4 800 ₽', icon: 'Settings' },
      { title: 'Диагностика Quattro', description: 'Диагностика полного привода', price: 'от 2 200 ₽', icon: 'Search' },
      { title: 'Обслуживание Quattro', description: 'Ремонт системы полного привода', price: 'от 7 000 ₽', icon: 'Gauge' },
      { title: 'Настройка MMI', description: 'Обновление и настройка мультимедиа', price: 'от 3 000 ₽', icon: 'Monitor' },
    ],
    features: ['Оригинальные запчасти Audi', 'Специалисты Quattro', 'Современная диагностика', 'Гарантия на работы']
  },
  volkswagen: {
    name: 'Volkswagen',
    description: 'Надежное обслуживание Volkswagen. Немецкая точность и качество.',
    logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/84abd4d1-43db-449e-a754-37eaca2356b7.jpg',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО VW', price: 'от 3 800 ₽', icon: 'Settings' },
      { title: 'Диагностика DSG', description: 'Диагностика робота DSG', price: 'от 1 800 ₽', icon: 'Search' },
      { title: 'Обслуживание TSI/TDI', description: 'Ремонт турбированных двигателей', price: 'от 6 500 ₽', icon: 'Wind' },
      { title: 'Замена ГРМ', description: 'Замена ремня/цепи ГРМ', price: 'от 5 000 ₽', icon: 'RotateCw' },
    ],
    features: ['Оригинальные запчасти VW', 'Опыт работы с DSG', 'Специализированная диагностика', 'Гарантия качества']
  },
  hyundai: {
    name: 'Hyundai',
    description: 'Качественное обслуживание Hyundai. Корейские технологии, доступные цены.',
    logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/b96818be-6317-4095-a3eb-ed039af61550.jpg',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Hyundai', price: 'от 3 200 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Компьютерная диагностика', price: 'от 1 200 ₽', icon: 'Search' },
      { title: 'Замена масла', description: 'Замена моторного масла', price: 'от 2 000 ₽', icon: 'Droplet' },
      { title: 'Ремонт ходовой', description: 'Ремонт подвески', price: 'от 4 000 ₽', icon: 'Wrench' },
    ],
    features: ['Оригинальные запчасти Hyundai', 'Доступные цены', 'Быстрое обслуживание', 'Гарантия на работы']
  },
  kia: {
    name: 'Kia',
    description: 'Профессиональное обслуживание Kia. Современный сервис для современных автомобилей.',
    logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/97ee8ca9-4c2a-4454-81ee-3c05a54f2661.jpg',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Kia', price: 'от 3 300 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Полная диагностика систем', price: 'от 1 300 ₽', icon: 'Search' },
      { title: 'Замена тормозных колодок', description: 'Замена колодок и дисков', price: 'от 3 500 ₽', icon: 'AlertCircle' },
      { title: 'Кондиционирование', description: 'Заправка и ремонт кондиционера', price: 'от 2 500 ₽', icon: 'Snowflake' },
    ],
    features: ['Оригинальные запчасти Kia', 'Быстрое обслуживание', 'Конкурентные цены', 'Гарантия на работы']
  },
  nissan: {
    name: 'Nissan',
    description: 'Специализированное обслуживание Nissan. Японское качество и надежность.',
    logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/94c95c26-2e2d-4849-929a-bbc56961a2b5.jpg',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Nissan', price: 'от 3 400 ₽', icon: 'Settings' },
      { title: 'Диагностика вариатора', description: 'Диагностика CVT', price: 'от 1 700 ₽', icon: 'Search' },
      { title: 'Обслуживание вариатора', description: 'Замена масла в CVT', price: 'от 4 500 ₽', icon: 'Cog' },
      { title: 'Ремонт двигателя', description: 'Ремонт моторов Nissan', price: 'от 8 000 ₽', icon: 'Engine' },
    ],
    features: ['Оригинальные запчасти Nissan', 'Опыт работы с вариаторами', 'Качественная диагностика', 'Гарантия на работы']
  }
};

export default function BrandPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const brand = brandId ? brandData[brandId.toLowerCase()] : null;

  if (!brand) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header setIsBookingOpen={setIsBookingOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Бренд не найден</h1>
            <Link to="/">
              <Button>На главную</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header setIsBookingOpen={setIsBookingOpen} />
      
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            На главную
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="w-32 h-32 bg-white rounded-2xl p-4 shadow-lg">
              <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <Badge className="mb-3 gradient-accent">Специализация</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{brand.name}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">{brand.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {brand.features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm">
                <Icon name="CheckCircle" className="mx-auto mb-2 text-primary" size={24} />
                <p className="text-sm font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Наши услуги для {brand.name}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {brand.services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-3">
                    <Icon name={service.icon as any} className="text-white" size={24} />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="gradient-primary btn-glow" onClick={() => setIsBookingOpen(true)}>
              Записаться на обслуживание
              <Icon name="ArrowRight" className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Нужна консультация?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Наши специалисты по {brand.name} готовы ответить на все ваши вопросы
          </p>
          <Button size="lg" variant="outline" asChild>
            <a href="tel:+79230166750">
              <Icon name="Phone" className="mr-2" size={20} />
              +7 (923) 016-67-50
            </a>
          </Button>
        </div>
      </section>

      <Footer />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>
    </div>
  );
}