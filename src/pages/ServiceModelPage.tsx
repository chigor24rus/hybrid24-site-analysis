import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/config/site';

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  brand_id: number;
  brand_name: string;
  name: string;
  year_from: number | null;
  year_to: number | null;
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
}

interface Price {
  id: number;
  brand_id: number;
  model_id: number | null;
  service_id: number;
  price: string;
}

const ServiceModelPage = () => {
  const { brandSlug, modelSlug, serviceSlug } = useParams<{ brandSlug: string; modelSlug: string; serviceSlug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [price, setPrice] = useState<Price | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, modelsRes, servicesRes, pricesRes] = await Promise.all([
          fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
          fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b'),
          fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc'),
          fetch('https://functions.poehali.dev/0cce410b-a4a1-4420-8df0-90d95a5055b7'),
        ]);

        const [brandsData, modelsData, servicesData, pricesData] = await Promise.all([
          brandsRes.json(),
          modelsRes.json(),
          servicesRes.json(),
          pricesRes.json(),
        ]);

        const brands: Brand[] = brandsData.brands || [];
        const models: Model[] = modelsData.models || [];
        const services: Service[] = servicesData.services || [];
        const prices: Price[] = pricesData.prices || [];

        const foundBrand = brands.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === brandSlug);
        const foundModel = models.find(m => m.name.toLowerCase().replace(/\s+/g, '-') === modelSlug && m.brand_id === foundBrand?.id);
        const foundService = services.find(s => s.title.toLowerCase().replace(/\s+/g, '-') === serviceSlug);

        if (!foundBrand || !foundModel || !foundService) {
          navigate('/404');
          return;
        }

        const foundPrice = prices.find(p => 
          p.brand_id === foundBrand.id && 
          p.service_id === foundService.id
        );

        setBrand(foundBrand);
        setModel(foundModel);
        setService(foundService);
        setPrice(foundPrice || null);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandSlug, modelSlug, serviceSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!brand || !model || !service) {
    return null;
  }

  const pageTitle = `${service.title} ${brand.name} ${model.name} в Красноярске`;
  const pageDescription = `${service.title} для ${brand.name} ${model.name}${model.year_from ? ` (${model.year_from}${model.year_to ? `-${model.year_to}` : '+'} г.)` : ''}. ${service.description} Цена: ${price?.price || service.price}. Время работы: ${service.duration}.`;
  const finalPrice = price?.price || service.price;
  
  const priceValue = finalPrice.replace(/[^\d]/g, '');
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": pageTitle,
    "description": pageDescription,
    "brand": {
      "@type": "Brand",
      "name": brand.name
    },
    "model": model.name,
    "offers": {
      "@type": "Offer",
      "url": `${SITE_CONFIG.domain}/${brandSlug}/${modelSlug}/${serviceSlug}`,
      "priceCurrency": "RUB",
      "price": priceValue,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "AutoRepair",
        "name": SITE_CONFIG.name,
        "telephone": SITE_CONFIG.phone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": SITE_CONFIG.address.street,
          "addressLocality": SITE_CONFIG.address.locality,
          "addressCountry": SITE_CONFIG.address.country
        }
      }
    },
    "category": service.title,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle} - {SITE_CONFIG.name}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_CONFIG.domain}/${brandSlug}/${modelSlug}/${serviceSlug}`} />
        <meta property="og:title" content={`${pageTitle} - ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`${SITE_CONFIG.domain}/${brandSlug}/${modelSlug}/${serviceSlug}`} />
        <meta property="og:type" content="product" />
        <meta property="og:price:amount" content={priceValue} />
        <meta property="og:price:currency" content="RUB" />
        <meta property="og:image" content={SITE_CONFIG.ogImage} />
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${pageTitle} - ${SITE_CONFIG.name}`} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={SITE_CONFIG.ogImage} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <Header setIsBookingOpen={setIsBookingOpen} />

      <section className="relative pt-32 pb-24 bg-gray-800 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80" 
          alt="Car service background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:text-white hover:bg-white/10">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад
            </Button>
          </div>

          <div className="mt-12 text-center text-white animate-fade-in">
            <div className="w-24 h-24 rounded-xl bg-white/20 flex items-center justify-center mb-6 mx-auto">
              <Icon name={service.icon} size={48} className="text-white" />
            </div>
            <Badge className="mb-6 px-6 py-3 text-lg bg-white/20 text-white border-white/30">{service.title}</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{service.title} {brand.name} {model.name}</h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {brand.name} {model.name}
              {model.year_from && (
                <span className="ml-2">
                  ({model.year_from}{model.year_to ? `-${model.year_to}` : '+'} г.)
                </span>
              )}
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <Badge variant="secondary" className="px-6 py-3 text-lg bg-white/20 text-white border-white/30">
                <Icon name="Clock" size={20} className="mr-2" />
                {service.duration}
              </Badge>
              <Badge variant="secondary" className="px-6 py-3 text-lg bg-white/20 text-white border-white/30">
                {finalPrice}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            <h2 className="text-3xl font-bold mb-6">Детали услуги</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="animate-fade-in">
                <CardHeader>
                  <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Icon name={service.icon} size={32} className="text-white" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Clock" size={18} />
                    <span>Время работы: {service.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Wrench" size={18} />
                    <span>Профессиональное оборудование</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="ShieldCheck" size={18} />
                    <span>Гарантия качества</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-fade-in border-primary/30" style={{ animationDelay: '100ms' }}>
                <CardHeader>
                  <CardTitle className="text-2xl">Стоимость услуги</CardTitle>
                  <CardDescription>Для вашего автомобиля</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">{finalPrice}</div>
                    {price && price.price !== service.price && (
                      <div className="text-sm text-muted-foreground">
                        Специальная цена для {brand.name} {model.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="Check" size={16} className="text-green-500" />
                      <span>Оригинальные запчасти</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Check" size={16} className="text-green-500" />
                      <span>Опытные мастера</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Check" size={16} className="text-green-500" />
                      <span>Гарантия на работы</span>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full gradient-primary btn-glow"
                    onClick={() => setIsBookingOpen(true)}
                  >
                    Записаться на услугу
                    <Icon name="ArrowRight" className="ml-2" size={20} />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">Описание услуги</h2>

            <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle>Что входит в работу</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                {service.title === 'Техническое обслуживание' && (
                  <>
                    <p>
                      Техническое обслуживание (ТО) вашего {brand.name} {model.name} — это залог надежности и безопасности на дороге. 
                      Мы предлагаем полный спектр регламентных работ, направленный на поддержание технического состояния 
                      автомобиля на высоком уровне. Своевременное прохождение ТО позволяет избежать серьезных поломок 
                      и существенно продлить ресурс авто.
                    </p>
                    <div>
                      <p className="font-semibold text-foreground mb-2">Наши преимущества:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Профессиональное диагностическое оборудование</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Оригинальные запасные части</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Опытные мастера, знающие специфику моделей {brand.name}</span>
                        </li>
                      </ul>
                    </div>
                    <p>
                      Запишитесь на техническое обслуживание удобным способом: онлайн или по телефону. 
                      Не упустите шанс сэкономить деньги, сохранив автомобиль в отличном состоянии!
                    </p>
                  </>
                )}
                
                {service.title === 'Диагностика двигателя' && (
                  <>
                    <p>
                      Диагностика двигателя {brand.name} {model.name} — это комплексная проверка всех систем силового агрегата 
                      с использованием современного оборудования. Мы выявляем скрытые неисправности на ранних стадиях, 
                      что позволяет избежать дорогостоящего ремонта в будущем.
                    </p>
                    <div>
                      <p className="font-semibold text-foreground mb-2">Что входит в диагностику:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Компьютерная диагностика с расшифровкой ошибок</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Проверка системы зажигания и топливной системы</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Анализ работы датчиков и электронных блоков</span>
                        </li>
                      </ul>
                    </div>
                    <p>
                      Запишитесь на диагностику — своевременное выявление проблем экономит ваше время и деньги!
                    </p>
                  </>
                )}
                
                {service.title === 'Замена масла' && (
                  <>
                    <p>
                      Замена масла в {brand.name} {model.name} — одна из важнейших процедур регулярного обслуживания. 
                      Качественное моторное масло обеспечивает надежную защиту двигателя от износа, перегрева и коррозии. 
                      Мы используем только сертифицированные масла, рекомендованные производителем.
                    </p>
                    <div>
                      <p className="font-semibold text-foreground mb-2">Что мы делаем:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Полная замена моторного масла и масляного фильтра</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Проверка уровня технических жидкостей</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Сброс межсервисного интервала</span>
                        </li>
                      </ul>
                    </div>
                    <p>
                      Регулярная замена масла — залог долгой и безотказной работы двигателя вашего автомобиля!
                    </p>
                  </>
                )}
                
                {service.title === 'Ремонт подвески' && (
                  <>
                    <p>
                      Ремонт подвески {brand.name} {model.name} требует профессионального подхода и знания конструктивных 
                      особенностей модели. Мы устраняем стуки, посторонние шумы, восстанавливаем плавность хода и управляемость 
                      автомобиля. Используем только качественные запчасти с гарантией.
                    </p>
                    <div>
                      <p className="font-semibold text-foreground mb-2">Наши услуги:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Замена амортизаторов, пружин, сайлентблоков</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Ремонт рычагов и стабилизаторов</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Развал-схождение после ремонта</span>
                        </li>
                      </ul>
                    </div>
                    <p>
                      Доверьте ремонт подвески профессионалам — ваша безопасность на дороге зависит от исправности ходовой части!
                    </p>
                  </>
                )}
                
                {service.title === 'Ремонт тормозной системы' && (
                  <>
                    <p>
                      Ремонт тормозной системы {brand.name} {model.name} — это вопрос безопасности, который не терпит компромиссов. 
                      Мы проводим диагностику, замену тормозных колодок, дисков, суппортов и прокачку тормозной жидкости. 
                      Гарантируем четкую и безопасную работу тормозов.
                    </p>
                    <div>
                      <p className="font-semibold text-foreground mb-2">Что включено:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Замена тормозных колодок и дисков</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Ремонт тормозных суппортов и цилиндров</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Проверка системы ABS</span>
                        </li>
                      </ul>
                    </div>
                    <p>
                      Не откладывайте ремонт тормозов — запишитесь на диагностику и обеспечьте себе безопасную езду!
                    </p>
                  </>
                )}
                
                {!['Техническое обслуживание', 'Диагностика двигателя', 'Замена масла', 'Ремонт подвески', 'Ремонт тормозной системы'].includes(service.title) && (
                  <>
                    <p>
                      {service.title} для {brand.name} {model.name} — профессиональное обслуживание с использованием 
                      современного оборудования и оригинальных запчастей. Наши специалисты имеют большой опыт работы 
                      с автомобилями {brand.name} и знают все особенности данной модели.
                    </p>
                    <div>
                      <p className="font-semibold text-foreground mb-2">Наши преимущества:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Профессиональное оборудование</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Качественные запчасти</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                          <span>Опытные мастера</span>
                        </li>
                      </ul>
                    </div>
                    <p>
                      Запишитесь на обслуживание — мы позаботимся о вашем автомобиле!
                    </p>
                  </>
                )}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-foreground mb-2">Почему выбирают нас:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                      <span>Быстрое и качественное обслуживание</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                      <span>Прозрачные цены без скрытых доплат</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                      <span>Гарантия на все виды работ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle2" size={18} className="text-primary mt-0.5" />
                      <span>Удобное расположение и график работы</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ServiceModelPage;