import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import Footer from '@/components/Footer';
import FloatingCallButton from '@/components/FloatingCallButton';
import ScrollToTopButton from '@/components/ScrollToTopButton';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  icon: string;
  image: string;
  content: {
    intro: string;
    sections: {
      title: string;
      text: string;
      list?: string[];
    }[];
    conclusion: string;
  };
}

const fallbackPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Как подготовить автомобиль к зиме',
    excerpt: 'Полный чек-лист подготовки авто к холодному сезону: от проверки аккумулятора до выбора незамерзайки',
    date: '20 ноября 2025',
    readTime: '5 мин',
    category: 'Советы',
    icon: 'Snowflake',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80',
    content: {
      intro: 'Зима — серьёзное испытание для любого автомобиля. Низкие температуры, агрессивные реагенты на дорогах и сложные погодные условия требуют особой подготовки. В этой статье мы расскажем, как правильно подготовить автомобиль к холодному сезону.',
      sections: [
        {
          title: '1. Проверка аккумулятора',
          text: 'Аккумулятор — первое, что страдает от мороза. При -20°C его ёмкость снижается почти вдвое. Если батарее больше 4-5 лет, рекомендуем заменить её перед зимой.',
          list: [
            'Проверьте заряд аккумулятора (должен быть не менее 12,5В)',
            'Осмотрите клеммы на наличие окисления',
            'Убедитесь в надёжности крепления батареи',
            'При необходимости зарядите аккумулятор'
          ]
        },
        {
          title: '2. Замена технических жидкостей',
          text: 'Все жидкости в автомобиле должны соответствовать зимним условиям эксплуатации.',
          list: [
            'Моторное масло: выбирайте синтетику с индексом вязкости 5W-30 или 0W-40',
            'Антифриз: проверьте концентрацию (должна выдерживать до -40°C)',
            'Тормозная жидкость: замените, если не меняли более 2 лет',
            'Незамерзайка: заливайте качественную жидкость с температурой замерзания -30°C'
          ]
        },
        {
          title: '3. Зимние шины',
          text: 'Переход на зимнюю резину обязателен при температуре ниже +7°C. Летние шины «дубеют» на морозе и теряют сцепление с дорогой.',
          list: [
            'Глубина протектора должна быть не менее 4 мм',
            'Проверьте давление в шинах (зимой оно снижается)',
            'Убедитесь в отсутствии повреждений и грыж',
            'Балансировка колёс обязательна'
          ]
        },
        {
          title: '4. Система отопления',
          text: 'Исправная печка — залог комфорта и безопасности зимой.',
          list: [
            'Проверьте работу всех режимов печки',
            'Замените салонный фильтр',
            'Прочистите дренажные отверстия',
            'Проверьте герметичность системы охлаждения'
          ]
        },
        {
          title: '5. Дополнительные рекомендации',
          text: 'Не забудьте о мелочах, которые сделают зимнюю эксплуатацию безопаснее.',
          list: [
            'Обработайте резиновые уплотнители силиконом',
            'Положите в багажник лопату, трос и провода для прикуривания',
            'Проверьте работу всех световых приборов',
            'Обновите щётки стеклоочистителей на зимние'
          ]
        }
      ],
      conclusion: 'Правильная подготовка автомобиля к зиме — это не просто комфорт, но и безопасность на дороге. Не откладывайте обслуживание на последний момент. Запишитесь на комплексную предзимнюю подготовку в нашем автосервисе — наши мастера проверят все важные системы и выполнят необходимые работы.'
    }
  },
  {
    id: 2,
    title: '5 признаков проблем с подвеской',
    excerpt: 'Узнайте, какие симптомы указывают на необходимость срочного ремонта ходовой части',
    date: '15 ноября 2025',
    readTime: '4 мин',
    category: 'Диагностика',
    icon: 'AlertTriangle',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80',
    content: {
      intro: 'Подвеска автомобиля отвечает за комфорт, управляемость и безопасность движения. Игнорирование проблем с ходовой частью может привести к серьёзным последствиям. Рассказываем о пяти главных признаках неисправностей.',
      sections: [
        {
          title: '1. Стуки и скрипы при езде',
          text: 'Посторонние звуки — первый сигнал о проблемах с подвеской. Стуки могут появляться на неровностях, при поворотах или разгоне.',
          list: [
            'Стук на кочках — износ амортизаторов или втулок стабилизатора',
            'Скрип при повороте руля — неисправность рулевых наконечников',
            'Глухой удар при торможении — люфт в шаровых опорах',
            'Металлический звон — ослабление крепежа элементов подвески'
          ]
        },
        {
          title: '2. Неравномерный износ шин',
          text: 'Если протектор стирается неравномерно, это явный признак проблем с ходовой частью или углами установки колёс.',
          list: [
            'Износ внутренней или внешней кромки — неправильный развал',
            'Пятнистый износ — дисбаланс колёс или неисправность амортизаторов',
            'Износ одной стороны на обеих передних шинах — нарушение схождения',
            'Выработка протектора посередине — избыточное давление в шинах'
          ]
        },
        {
          title: '3. Увод автомобиля в сторону',
          text: 'Машина перестала ехать прямо и постоянно тянет влево или вправо? Это опасно и требует немедленной диагностики.',
          list: [
            'Увод при прямолинейном движении — нарушение развала-схождения',
            'Увод при торможении — заклинивший суппорт или неравномерный износ колодок',
            'Увод после замены шин — необходима балансировка',
            'Постоянное подруливание — люфт в рулевом управлении'
          ]
        },
        {
          title: '4. Вибрации и раскачивание',
          text: 'Комфорт езды зависит от исправности амортизаторов. Если машину раскачивает или появились вибрации — пора на диагностику.',
          list: [
            'Раскачивание после проезда неровностей — износ амортизаторов',
            'Вибрация на скорости 80-100 км/ч — дисбаланс колёс',
            'Вибрация при торможении — деформация тормозных дисков',
            'Раскачивание при повороте — неисправность стабилизатора поперечной устойчивости'
          ]
        },
        {
          title: '5. Течь масла из амортизаторов',
          text: 'Визуальный осмотр может многое рассказать о состоянии подвески. Потёки масла на корпусе амортизатора — критичная неисправность.',
          list: [
            'Масляные подтёки на штоке — разрушение сальника',
            'Влажный корпус амортизатора — потеря герметичности',
            'Неравномерная работа при раскачивании — выход из строя клапанов',
            'Деформация корпуса — повреждение после удара'
          ]
        }
      ],
      conclusion: 'Не игнорируйте эти признаки! Своевременная диагностика и ремонт подвески обойдутся дешевле, чем восстановление после серьёзной поломки. В нашем автосервисе проведут полную компьютерную диагностику ходовой части и устранят все неисправности. Запишитесь на проверку подвески прямо сейчас!'
    }
  },
  {
    id: 3,
    title: 'Когда менять моторное масло',
    excerpt: 'Развенчиваем мифы о замене масла и рассказываем о реальных сроках',
    date: '10 ноября 2025',
    readTime: '6 мин',
    category: 'Обслуживание',
    icon: 'Droplet',
    image: 'https://images.unsplash.com/photo-1606016159991-4b5e2f6be5e5?w=1200&q=80',
    content: {
      intro: 'Вопрос о периодичности замены моторного масла окружён множеством мифов. Одни меняют каждые 5 000 км, другие растягивают до 20 000 км. Разбираемся, как часто на самом деле нужно менять масло и от чего это зависит.',
      sections: [
        {
          title: 'Рекомендации производителя — основа',
          text: 'Первое правило — следовать указаниям производителя автомобиля. Эти данные есть в сервисной книжке и основаны на реальных испытаниях двигателя.',
          list: [
            'Современные двигатели: 10 000 — 15 000 км или раз в год',
            'Турбированные моторы: 8 000 — 10 000 км',
            'Дизельные двигатели: 7 500 — 10 000 км',
            'Старые автомобили (до 2000 г.): 5 000 — 7 000 км'
          ]
        },
        {
          title: 'Условия эксплуатации имеют значение',
          text: 'Производители указывают интервалы для «нормальных» условий. Но в России большинство условий считаются тяжёлыми.',
          list: [
            'Городские пробки — сокращайте интервал на 30-40%',
            'Короткие поездки (до 20 км) — масло не прогревается полностью',
            'Пыльные дороги — масло загрязняется быстрее',
            'Морозы ниже -25°C — увеличенная нагрузка при запуске',
            'Спортивный стиль езды — повышенные обороты и температура'
          ]
        },
        {
          title: 'Типы масел и их ресурс',
          text: 'Качество масла напрямую влияет на интервал замены. Не все масла одинаково полезны.',
          list: [
            'Минеральное масло — 5 000 — 7 000 км (не рекомендуется для современных авто)',
            'Полусинтетика — 7 000 — 10 000 км',
            'Синтетика — 10 000 — 15 000 км',
            'Long Life масла — до 30 000 км (только для специальных двигателей)'
          ]
        },
        {
          title: 'Признаки необходимости замены',
          text: 'Даже если по пробегу рано менять масло, следите за его состоянием. Иногда масло «умирает» раньше срока.',
          list: [
            'Потемнение масла — норма, но чёрное масло нужно менять',
            'Появление запаха гари — перегрев или попадание топлива',
            'Снижение уровня — проверьте на утечки и долейте',
            'Металлическая стружка на щупе — критический износ двигателя',
            'Молочный цвет — попадание антифриза (срочно в сервис!)'
          ]
        },
        {
          title: 'Мифы о замене масла',
          text: 'Развенчиваем популярные заблуждения о моторном масле.',
          list: [
            'МИФ: Можно ездить 20 000 км — в России это опасно из-за тяжёлых условий',
            'МИФ: Масло можно не менять, если доливать свежее — старое масло теряет свойства',
            'МИФ: Чем чаще менять, тем лучше — разумный минимум 5 000 км',
            'МИФ: Промывка двигателя обязательна — нужна только при сильном загрязнении',
            'МИФ: Синтетику нельзя заливать после минералки — можно при правильном подборе'
          ]
        }
      ],
      conclusion: 'Оптимальный интервал замены масла — 7 500 — 10 000 км для большинства автомобилей в российских условиях. Используйте качественную синтетику, следите за уровнем и состоянием масла. В нашем автосервисе используем только проверенные масла и фильтры. Запишитесь на замену масла онлайн и получите скидку 10%!'
    }
  }
];

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`https://functions.poehali.dev/e92433da-3db2-4e99-b9d6-a4596b987e6a?id=${id}`);
        const data = await response.json();
        
        if (response.ok && data.post) {
          setPost(data.post);
        } else {
          const fallback = fallbackPosts.find(p => p.id === Number(id));
          setPost(fallback || null);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        const fallback = fallbackPosts.find(p => p.id === Number(id));
        setPost(fallback || null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <BookingDialog setIsBookingOpen={setIsBookingOpen} />
        </Dialog>
        <div className="min-h-screen flex items-center justify-center">
          <Icon name="Loader" className="animate-spin" size={48} />
        </div>
        <Footer />
        <FloatingCallButton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <BookingDialog setIsBookingOpen={setIsBookingOpen} />
        </Dialog>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Icon name="FileQuestion" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Статья не найдена</h1>
            <Button asChild>
              <Link to="/">
                <Icon name="ArrowLeft" className="mr-2" size={18} />
                На главную
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
        <FloatingCallButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>
      <div className="relative h-[400px] bg-gray-900 overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="container mx-auto px-4 h-full flex items-center relative z-20">
          <div className="max-w-4xl">
            <div className="mb-6">
              <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-white/80 hover:text-white transition-colors"
              >
                <Icon name="ArrowLeft" className="mr-2" size={18} />
                Назад
              </button>
            </div>
            <Badge className="mb-4">{post.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-white/80">
              <span className="flex items-center gap-2">
                <Icon name="Calendar" size={16} />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Icon name="Clock" size={16} />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            {post.content.intro}
          </p>

          {post.content.sections.map((section, index) => (
            <section key={index} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Icon name={post.icon as any} size={28} className="text-primary" />
                {section.title}
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {section.text}
              </p>
              {section.list && (
                <ul className="space-y-2 ml-6">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon name="CheckCircle" size={20} className="text-green-600 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-lg my-8">
            <p className="text-lg leading-relaxed">
              {post.content.conclusion}
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="gradient-primary" asChild>
            <Link to="/">
              Записаться на обслуживание
              <Icon name="ArrowRight" className="ml-2" size={20} />
            </Link>
          </Button>
        </div>

        <div className="text-center mt-12 animate-fade-in">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate(-1)}
            className="group"
          >
            <Icon name="ArrowLeft" size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Назад
          </Button>
        </div>
      </article>

      <Footer />
      <FloatingCallButton />
      <ScrollToTopButton />
    </div>
  );
};

export default BlogPostPage;