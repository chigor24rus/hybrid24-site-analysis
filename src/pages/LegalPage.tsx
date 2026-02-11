import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import BookingDialog from '@/components/BookingDialog';
import Footer from '@/components/Footer';

import ScrollToTopButton from '@/components/ScrollToTopButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_CONFIG } from '@/config/site';

const LegalPage = () => {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const canonicalUrl = `${SITE_CONFIG.domain}${location.pathname}`;

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Правовая информация - HEVSR</title>
        <meta name="description" content="Правовая информация, политика конфиденциальности и пользовательское соглашение автосервиса HEVSR в Красноярске" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Правовая информация - HEVSR" />
        <meta property="og:description" content="Правовая информация, политика конфиденциальности и пользовательское соглашение автосервиса HEVSR" />
        <meta property="og:site_name" content="HEVSR" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Правовая информация - HEVSR" />
        <meta name="twitter:description" content="Правовая информация и пользовательское соглашение" />
        <meta name="twitter:image" content="https://cdn.poehali.dev/files/2025-12-13_14-19-48.png" />
      </Helmet>
      
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <BookingDialog setIsBookingOpen={setIsBookingOpen} />
      </Dialog>

      <section className="py-12 md:py-20 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: 'Правовая информация' }]} />
          
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <Badge className="mb-4 gradient-accent text-sm">Юридическая информация</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Правовая информация</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Политика конфиденциальности и пользовательское соглашение
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl">Общие сведения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Полное наименование:</strong> ИП "HEVSeRvice"<br />
                  <strong>Адрес:</strong> г. Красноярск, ул. Водопьянова, д. 1К<br />
                  <strong>Телефон:</strong> +7 (923) 016-67-50<br />
                  <strong>Email:</strong> info@hybrid24.ru
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Политика конфиденциальности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <h3 className="text-lg font-semibold text-foreground">1. Сбор персональных данных</h3>
                <p>
                  Мы собираем только те персональные данные, которые необходимы для оказания услуг:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>ФИО клиента</li>
                  <li>Контактный телефон</li>
                  <li>Адрес электронной почты</li>
                  <li>Информация об автомобиле (марка, модель, VIN)</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6">2. Использование данных</h3>
                <p>Ваши персональные данные используются исключительно для:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Записи на обслуживание и ремонт</li>
                  <li>Информирования о статусе работ</li>
                  <li>Отправки напоминаний о плановом ТО</li>
                  <li>Предоставления информации об акциях и специальных предложениях (с вашего согласия)</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6">3. Защита данных</h3>
                <p>
                  Мы применяем современные технические и организационные меры для защиты ваших персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения. Доступ к персональным данным имеют только уполномоченные сотрудники, которые обязаны соблюдать конфиденциальность.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">4. Передача данных третьим лицам</h3>
                <p>
                  Мы не передаем ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">5. Ваши права</h3>
                <p>Вы имеете право:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Запрашивать информацию о ваших персональных данных</li>
                  <li>Требовать исправления неточных данных</li>
                  <li>Требовать удаления ваших данных</li>
                  <li>Отозвать согласие на обработку персональных данных</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Пользовательское соглашение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <h3 className="text-lg font-semibold text-foreground">1. Общие положения</h3>
                <p>
                  Настоящее соглашение регулирует отношения между автосервисом HEVSR и клиентами, использующими услуги сервиса. Использование услуг означает полное и безоговорочное принятие условий настоящего соглашения.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">2. Обязательства сторон</h3>
                <p><strong>Автосервис обязуется:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Оказывать услуги качественно и в согласованные сроки</li>
                  <li>Использовать оригинальные запчасти или их качественные аналоги</li>
                  <li>Предоставлять гарантию на выполненные работы</li>
                  <li>Информировать клиента о ходе выполнения работ</li>
                </ul>

                <p className="mt-4"><strong>Клиент обязуется:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Предоставить достоверную информацию об автомобиле</li>
                  <li>Своевременно оплачивать оказанные услуги</li>
                  <li>Забирать автомобиль в согласованные сроки</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6">3. Ответственность</h3>
                <p>
                  Автосервис не несет ответственности за:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Скрытые дефекты, выявленные в процессе ремонта</li>
                  <li>Последствия неквалифицированного вмешательства третьих лиц</li>
                  <li>Повреждения, возникшие вследствие форс-мажорных обстоятельств</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6">4. Разрешение споров</h3>
                <p>
                  Все споры и разногласия разрешаются путем переговоров. В случае невозможности достижения согласия, споры разрешаются в соответствии с действующим законодательством Российской Федерации.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Использование cookie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Наш сайт использует файлы cookie для улучшения работы сайта и предоставления более персонализированного опыта. Cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении сайта.
                </p>
                <p><strong>Мы используем cookie для:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Запоминания ваших предпочтений</li>
                  <li>Анализа посещаемости сайта</li>
                  <li>Улучшения функциональности сайта</li>
                </ul>
                <p>
                  Вы можете отключить использование cookie в настройках вашего браузера, однако это может ограничить функциональность сайта.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle className="text-2xl">Контактная информация</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Если у вас есть вопросы или предложения относительно политики конфиденциальности или пользовательского соглашения, пожалуйста, свяжитесь с нами:
                </p>
                <p className="mt-4">
                  <strong>Телефон:</strong> +7 (923) 016-67-50<br />
                  <strong>Email:</strong> info@hybrids24.ru<br />
                  <strong>Адрес:</strong> г. Красноярск, ул. Водопьянова, д. 1К
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      <ScrollToTopButton />
    </div>
  );
};

export default LegalPage;