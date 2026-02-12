import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

interface ServiceDescriptionProps {
  brand: Brand;
  model: Model;
  service: Service;
}

export default function ServiceDescription({ brand, model, service }: ServiceDescriptionProps) {
  return (
    <>
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
    </>
  );
}
