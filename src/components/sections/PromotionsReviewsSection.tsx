import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

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

interface Review {
  id: number | string;
  name: string;
  rating: number;
  date: string;
  text: string;
  service: string;
}

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

interface PromotionsReviewsSectionProps {
  setIsBookingOpen: (open: boolean) => void;
}

const PromotionsReviewsSection = ({ setIsBookingOpen }: PromotionsReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/24530517-9b0c-4a6b-957e-ac05025d52ce');
        const data = await response.json();
        
        if (response.ok && data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews.slice(0, 4));
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <>
      <section id="promotions" className="py-12 md:py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <Link to="/promotions" className="group inline-block">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-3">
                Акции и спецпредложения
                <Icon name="ArrowRight" size={32} className="group-hover:translate-x-2 transition-transform" />
              </h2>
            </Link>
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
          {loadingReviews ? (
            <div className="text-center py-12">
              <Icon name="Loader" className="animate-spin mx-auto" size={48} />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="MessageSquare" className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Отзывов пока нет</p>
            </div>
          ) : (
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
          )}
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
    </>
  );
};

export default PromotionsReviewsSection;