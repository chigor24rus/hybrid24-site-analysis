import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const brands = [
  { name: 'Toyota', logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/4e08abc9-6dc7-4175-88e7-4506631ccebe.jpg' },
  { name: 'BMW', logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/4de578b1-4cb2-4791-8ab0-306463ecef8f.jpg' },
  { name: 'Mercedes', logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/5fcb3172-9037-4e6e-8252-979e327dd734.jpg' },
  { name: 'Audi', logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/ba02db5f-9801-4420-8836-39f52c1eb11f.jpg' },
  { name: 'Volkswagen', logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/84abd4d1-43db-449e-a754-37eaca2356b7.jpg' },
  { name: 'Hyundai', logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/b96818be-6317-4095-a3eb-ed039af61550.jpg' },
  { name: 'Kia', logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/97ee8ca9-4c2a-4454-81ee-3c05a54f2661.jpg' },
  { name: 'Nissan', logo: 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/94c95c26-2e2d-4849-929a-bbc56961a2b5.jpg' }
];

const promotions = [
  {
    id: 1,
    title: 'Сезонное ТО',
    description: 'Комплексная диагностика + замена масла со скидкой 25%',
    discount: '-25%',
    oldPrice: '6 000 ₽',
    newPrice: '4 500 ₽',
    validUntil: '31 декабря 2025',
    icon: 'Percent'
  },
  {
    id: 2,
    title: 'Шиномонтаж 4+1',
    description: 'При покупке 4 шин — шиномонтаж в подарок',
    discount: 'Подарок',
    oldPrice: '8 000 ₽',
    newPrice: '6 000 ₽',
    validUntil: '15 января 2026',
    icon: 'Gift'
  },
  {
    id: 3,
    title: 'Первое посещение',
    description: 'Скидка 15% на любые услуги для новых клиентов',
    discount: '-15%',
    oldPrice: '',
    newPrice: 'На все',
    validUntil: 'Постоянно',
    icon: 'Sparkles'
  }
];

const reviews = [
  {
    id: 1,
    name: 'Александр Петров',
    rating: 5,
    date: '15 ноября 2025',
    text: 'Отличный сервис! Быстро продиагностировали и устранили проблему с двигателем. Мастера профессионалы своего дела.',
    service: 'Диагностика двигателя'
  },
  {
    id: 2,
    name: 'Мария Сидорова',
    rating: 5,
    date: '10 ноября 2025',
    text: 'Делала ТО здесь уже второй раз. Все четко, по времени, цены адекватные. Очень довольна!',
    service: 'Техническое обслуживание'
  },
  {
    id: 3,
    name: 'Дмитрий Козлов',
    rating: 4,
    date: '5 ноября 2025',
    text: 'Хороший автосервис, качественная работа. Единственное — пришлось немного подождать своей очереди.',
    service: 'Замена масла'
  },
  {
    id: 4,
    name: 'Елена Морозова',
    rating: 5,
    date: '1 ноября 2025',
    text: 'После ДТП восстанавливали кузов. Работу выполнили отлично, как будто машина новая! Спасибо команде!',
    service: 'Кузовной ремонт'
  }
];

const blogPosts = [
  {
    id: 1,
    title: 'Как подготовить автомобиль к зиме',
    excerpt: 'Полный чек-лист подготовки авто к холодному сезону: от проверки аккумулятора до выбора незамерзайки',
    date: '20 ноября 2025',
    readTime: '5 мин',
    category: 'Советы',
    icon: 'Snowflake'
  },
  {
    id: 2,
    title: '5 признаков проблем с подвеской',
    excerpt: 'Узнайте, какие симптомы указывают на необходимость срочного ремонта ходовой части',
    date: '15 ноября 2025',
    readTime: '4 мин',
    category: 'Диагностика',
    icon: 'AlertTriangle'
  },
  {
    id: 3,
    title: 'Когда менять моторное масло',
    excerpt: 'Развенчиваем мифы о замене масла и рассказываем о реальных сроках',
    date: '10 ноября 2025',
    readTime: '6 мин',
    category: 'Обслуживание',
    icon: 'Droplet'
  }
];

const services = [
  {
    id: 1,
    title: 'Техническое обслуживание',
    description: 'Комплексная проверка и обслуживание автомобиля',
    price: 'от 3 500 ₽',
    duration: '2 часа',
    icon: 'Wrench'
  },
  {
    id: 2,
    title: 'Диагностика двигателя',
    description: 'Компьютерная диагностика и выявление неисправностей',
    price: 'от 1 500 ₽',
    duration: '1 час',
    icon: 'Settings'
  },
  {
    id: 3,
    title: 'Замена масла',
    description: 'Замена моторного масла и масляного фильтра',
    price: 'от 1 200 ₽',
    duration: '30 мин',
    icon: 'Droplet'
  },
  {
    id: 4,
    title: 'Шиномонтаж',
    description: 'Сезонная замена шин, балансировка',
    price: 'от 2 000 ₽',
    duration: '1 час',
    icon: 'Disc'
  },
  {
    id: 5,
    title: 'Ремонт ходовой',
    description: 'Диагностика и ремонт подвески автомобиля',
    price: 'от 5 000 ₽',
    duration: '3 часа',
    icon: 'Construction'
  },
  {
    id: 6,
    title: 'Кузовной ремонт',
    description: 'Восстановление кузова после ДТП',
    price: 'от 10 000 ₽',
    duration: 'от 1 дня',
    icon: 'Car'
  }
];

interface SectionsProps {
  setIsBookingOpen: (open: boolean) => void;
}

const Sections = ({ setIsBookingOpen }: SectionsProps) => {
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  const toggleService = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    const basePrices: { [key: number]: number } = {
      1: 3500,
      2: 1500,
      3: 1200,
      4: 2000,
      5: 5000,
      6: 10000
    };
    return selectedServices.reduce((sum, id) => sum + basePrices[id], 0);
  };

  return (
    <>
      <section 
        className="py-12 md:py-20 lg:py-32 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: 'url(https://cdn.poehali.dev/files/690e89b6-5b7c-486e-a234-151943ca4841.png)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-white/95 to-white/70"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-3 md:mb-4 gradient-accent text-xs md:text-sm">Быстро • Качественно • Надёжно</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              Профессиональный
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">автосервис</span>
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

      <section id="services" className="py-12 md:py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Наши услуги</h2>
            <p className="text-muted-foreground text-base md:text-lg">Полный спектр услуг для вашего автомобиля</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card
                key={service.id}
                className="hover-scale cursor-pointer hover:border-primary/50 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Icon name={service.icon as any} size={24} className="text-white" />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{service.price}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Icon name="Clock" size={14} className="mr-1" />
                        {service.duration}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsBookingOpen(true)}>
                      Записаться
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="calculator" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12 animate-fade-in">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Калькулятор стоимости</h2>
              <p className="text-muted-foreground text-base md:text-lg">Рассчитайте примерную стоимость услуг</p>
            </div>
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Выберите необходимые услуги</CardTitle>
                <CardDescription>Отметьте галочками нужные позиции</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(service => (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedServices.includes(service.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleService(service.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{service.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          <div className="flex gap-3 text-sm">
                            <span className="text-primary font-semibold">{service.price}</span>
                            <span className="text-muted-foreground flex items-center">
                              <Icon name="Clock" size={14} className="mr-1" />
                              {service.duration}
                            </span>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedServices.includes(service.id)
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}>
                          {selectedServices.includes(service.id) && (
                            <Icon name="Check" size={16} className="text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedServices.length > 0 && (
                  <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 md:p-6 rounded-lg border border-primary/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs md:text-sm text-muted-foreground mb-1">Выбрано услуг: {selectedServices.length}</div>
                        <div className="text-2xl md:text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                          {calculateTotal().toLocaleString()} ₽
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground mt-1">Предварительная стоимость</div>
                      </div>
                      <Button size="lg" className="gradient-primary btn-glow w-full md:w-auto" onClick={() => setIsBookingOpen(true)}>
                        Записаться на услуги
                        <Icon name="ArrowRight" className="ml-2" size={20} />
                      </Button>
                    </div>
                  </div>
                )}

                {selectedServices.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Calculator" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Выберите услуги для расчёта стоимости</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="brands" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Бренды, с которыми мы работаем</h2>
            <p className="text-muted-foreground text-base md:text-lg">Обслуживаем все популярные марки автомобилей</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {brands.map((brand, index) => (
              <Card
                key={index}
                className="hover-scale cursor-pointer text-center p-4 md:p-6 lg:p-8 animate-fade-in bg-white"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img src={brand.logo} alt={brand.name} className="w-full h-12 sm:h-16 md:h-20 lg:h-24 object-contain" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="promotions" className="py-12 md:py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Акции и спецпредложения</h2>
            <p className="text-muted-foreground text-base md:text-lg">Выгодные предложения для наших клиентов</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {promotions.map((promo, index) => (
              <Card
                key={promo.id}
                className="hover-scale cursor-pointer animate-fade-in relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="gradient-accent text-lg px-3 py-1">{promo.discount}</Badge>
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Icon name={promo.icon as any} size={24} className="text-white" />
                  </div>
                  <CardTitle className="text-2xl">{promo.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{promo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-3">
                      {promo.oldPrice && (
                        <span className="text-muted-foreground line-through text-lg">{promo.oldPrice}</span>
                      )}
                      <span className="text-3xl font-bold text-primary">{promo.newPrice}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Clock" size={14} />
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
        </div>
      </section>

      <section id="reviews" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Отзывы клиентов</h2>
            <p className="text-muted-foreground text-base md:text-lg">Что говорят о нас наши клиенты</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <Card
                key={review.id}
                className="hover-scale animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{review.name}</CardTitle>
                      <CardDescription className="mt-1">{review.date}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Icon key={i} name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{review.text}</p>
                  <Badge variant="outline" className="mt-2">
                    <Icon name="CheckCircle" size={14} className="mr-1" />
                    {review.service}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="py-12 md:py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Полезный блог</h2>
            <p className="text-muted-foreground text-base md:text-lg">Статьи и советы по обслуживанию автомобиля</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {blogPosts.map((post, index) => (
              <Card
                key={post.id}
                className="hover-scale cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Icon name={post.icon as any} size={24} className="text-white" />
                  </div>
                  <Badge variant="outline" className="w-fit mb-2">{post.category}</Badge>
                  <CardTitle className="text-xl leading-tight">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={14} />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" size={14} />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Читать далее
                    <Icon name="ArrowRight" className="ml-2" size={16} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="py-12 md:py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Свяжитесь с нами</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="hover-scale">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Icon name="Phone" size={24} className="text-white" />
                  </div>
                  <CardTitle>Телефон</CardTitle>
                  <CardDescription className="text-lg">
                    <a href="tel:+79230166750" className="hover:text-primary transition-colors">
                      +7 (923) 016-67-50
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover-scale">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Icon name="MapPin" size={24} className="text-white" />
                  </div>
                  <CardTitle>Адрес</CardTitle>
                  <CardDescription className="text-lg">Москва, ул. Автомобильная, 15</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover-scale">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Icon name="Clock" size={24} className="text-white" />
                  </div>
                  <CardTitle>Режим работы</CardTitle>
                  <CardDescription className="text-lg">Пн-Вс: 8:15 - 19:45</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Sections;