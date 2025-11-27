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
  honda: {
    name: 'Honda',
    description: 'Профессиональное обслуживание Honda. Японская надежность и технологии.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Honda',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Honda', price: 'от 3 400 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Компьютерная диагностика', price: 'от 1 400 ₽', icon: 'Search' },
      { title: 'Ремонт двигателя VTEC', description: 'Обслуживание системы VTEC', price: 'от 7 000 ₽', icon: 'Wrench' },
      { title: 'Замена масла', description: 'Оригинальное масло Honda', price: 'от 2 300 ₽', icon: 'Droplet' },
    ],
    features: ['Оригинальные запчасти Honda', 'Опыт работы с VTEC', 'Качественная диагностика', 'Гарантия на работы']
  },
  lexus: {
    name: 'Lexus',
    description: 'Премиальное обслуживание Lexus. Роскошь и качество.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Lexus',
    services: [
      { title: 'Техническое обслуживание', description: 'ТО премиум-класса', price: 'от 4 500 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Полная диагностика Lexus', price: 'от 2 000 ₽', icon: 'Search' },
      { title: 'Обслуживание гибридов', description: 'Ремонт гибридных систем', price: 'от 9 000 ₽', icon: 'Zap' },
      { title: 'Детейлинг салона', description: 'Премиальная химчистка', price: 'от 8 000 ₽', icon: 'Sparkles' },
    ],
    features: ['Оригинальные запчасти Lexus', 'Премиальное обслуживание', 'Опыт с гибридами', 'Полная гарантия']
  },
  mazda: {
    name: 'Mazda',
    description: 'Качественное обслуживание Mazda. Технологии SKYACTIV.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Mazda',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Mazda', price: 'от 3 300 ₽', icon: 'Settings' },
      { title: 'Диагностика SKYACTIV', description: 'Диагностика двигателей SKYACTIV', price: 'от 1 500 ₽', icon: 'Search' },
      { title: 'Ремонт подвески', description: 'Замена амортизаторов, стоек', price: 'от 5 000 ₽', icon: 'Wrench' },
      { title: 'Замена масла', description: 'Оригинальное масло Mazda', price: 'от 2 200 ₽', icon: 'Droplet' },
    ],
    features: ['Оригинальные запчасти Mazda', 'Специалисты SKYACTIV', 'Быстрое обслуживание', 'Гарантия качества']
  },
  mitsubishi: {
    name: 'Mitsubishi',
    description: 'Надежное обслуживание Mitsubishi. Японские технологии.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Mitsubishi',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Mitsubishi', price: 'от 3 200 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Компьютерная диагностика', price: 'от 1 300 ₽', icon: 'Search' },
      { title: 'Ремонт полного привода', description: 'Обслуживание 4WD систем', price: 'от 6 500 ₽', icon: 'Gauge' },
      { title: 'Замена ГРМ', description: 'Замена ремня ГРМ', price: 'от 4 800 ₽', icon: 'RotateCw' },
    ],
    features: ['Оригинальные запчасти Mitsubishi', 'Опыт работы с 4WD', 'Доступные цены', 'Гарантия на работы']
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
  },
  subaru: {
    name: 'Subaru',
    description: 'Обслуживание Subaru. Оппозитные двигатели и полный привод.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Subaru',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Subaru', price: 'от 3 600 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Диагностика оппозитного двигателя', price: 'от 1 600 ₽', icon: 'Search' },
      { title: 'Обслуживание AWD', description: 'Ремонт системы полного привода', price: 'от 7 000 ₽', icon: 'Gauge' },
      { title: 'Замена масла', description: 'Оригинальное масло Subaru', price: 'от 2 400 ₽', icon: 'Droplet' },
    ],
    features: ['Оригинальные запчасти', 'Опыт с оппозитниками', 'Специалисты AWD', 'Гарантия качества']
  },
  suzuki: {
    name: 'Suzuki',
    description: 'Обслуживание Suzuki. Компактные и надежные автомобили.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Suzuki',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Suzuki', price: 'от 2 800 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Компьютерная диагностика', price: 'от 1 200 ₽', icon: 'Search' },
      { title: 'Замена масла', description: 'Замена моторного масла', price: 'от 2 000 ₽', icon: 'Droplet' },
      { title: 'Ремонт ходовой', description: 'Ремонт подвески', price: 'от 3 500 ₽', icon: 'Wrench' },
    ],
    features: ['Доступные цены', 'Быстрое обслуживание', 'Качественные запчасти', 'Гарантия на работы']
  },
  acura: {
    name: 'Acura',
    description: 'Премиальное обслуживание Acura. Технологии Honda премиум-класса.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Acura',
    services: [
      { title: 'Техническое обслуживание', description: 'Премиальное ТО', price: 'от 4 200 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Полная диагностика систем', price: 'от 1 800 ₽', icon: 'Search' },
      { title: 'Обслуживание SH-AWD', description: 'Ремонт интеллектуального полного привода', price: 'от 8 500 ₽', icon: 'Gauge' },
      { title: 'Детейлинг', description: 'Премиальная химчистка салона', price: 'от 7 000 ₽', icon: 'Sparkles' },
    ],
    features: ['Оригинальные запчасти', 'Премиальный сервис', 'Опытные мастера', 'Полная гарантия']
  },
  haval: {
    name: 'Haval',
    description: 'Обслуживание Haval. Современные китайские SUV.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Haval',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Haval', price: 'от 3 000 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Компьютерная диагностика', price: 'от 1 400 ₽', icon: 'Search' },
      { title: 'Замена масла', description: 'Замена моторного масла', price: 'от 2 200 ₽', icon: 'Droplet' },
      { title: 'Ремонт подвески', description: 'Ремонт ходовой части', price: 'от 4 500 ₽', icon: 'Wrench' },
    ],
    features: ['Оригинальные запчасти', 'Доступные цены', 'Быстрое обслуживание', 'Гарантия качества']
  },
  geely: {
    name: 'Geely',
    description: 'Обслуживание Geely. Надежные китайские автомобили.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Geely',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Geely', price: 'от 2 900 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Полная диагностика', price: 'от 1 300 ₽', icon: 'Search' },
      { title: 'Замена масла', description: 'Замена моторного масла', price: 'от 2 100 ₽', icon: 'Droplet' },
      { title: 'Ремонт АКПП', description: 'Обслуживание коробки передач', price: 'от 6 000 ₽', icon: 'Cog' },
    ],
    features: ['Качественные запчасти', 'Доступные цены', 'Опытные мастера', 'Гарантия на работы']
  },
  changan: {
    name: 'Changan',
    description: 'Обслуживание Changan. Современные технологии.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Changan',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО', price: 'от 2 800 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Компьютерная диагностика', price: 'от 1 200 ₽', icon: 'Search' },
      { title: 'Замена масла', description: 'Замена моторного масла', price: 'от 2 000 ₽', icon: 'Droplet' },
      { title: 'Ремонт ходовой', description: 'Ремонт подвески', price: 'от 4 000 ₽', icon: 'Wrench' },
    ],
    features: ['Доступные цены', 'Качественный сервис', 'Быстрое обслуживание', 'Гарантия']
  },
  chery: {
    name: 'Chery',
    description: 'Обслуживание Chery. Проверенные китайские автомобили.',
    logo: 'https://via.placeholder.com/150x150/ffffff/666666?text=Chery',
    services: [
      { title: 'Техническое обслуживание', description: 'Регламентное ТО Chery', price: 'от 2 700 ₽', icon: 'Settings' },
      { title: 'Диагностика', description: 'Компьютерная диагностика', price: 'от 1 200 ₽', icon: 'Search' },
      { title: 'Замена масла', description: 'Замена моторного масла', price: 'от 2 000 ₽', icon: 'Droplet' },
      { title: 'Ремонт двигателя', description: 'Ремонт силового агрегата', price: 'от 7 000 ₽', icon: 'Engine' },
    ],
    features: ['Оригинальные запчасти', 'Доступные цены', 'Опыт работы', 'Гарантия качества']
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