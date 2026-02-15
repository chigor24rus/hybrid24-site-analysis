import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { AdminLayout, AdminPageHeader } from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminSeoGuidePage = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [isPinging, setIsPinging] = useState(false);

  const handlePingSearchEngines = async () => {
    setIsPinging(true);
    try {
      const response = await fetch('https://functions.poehali.dev/d8a6de65-c081-4edd-9267-3cc041b42dcb', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        const successes = Object.entries(data.results)
          .filter(([, status]) => status === 'success')
          .map(([engine]) => engine);
        
        if (successes.length > 0) {
          toast.success(`Уведомление отправлено: ${successes.join(', ')}`);
        } else {
          toast.error('Не удалось уведомить поисковики');
        }
      } else {
        toast.error('Ошибка при отправке уведомлений');
      }
    } catch (error) {
      console.error('Error pinging search engines:', error);
      toast.error('Ошибка при отправке уведомлений');
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <AdminLayout
      title="SEO Инструкция"
      onNavigateHome={() => navigate('/admin')}
      onLogout={logout}
    >
      <AdminPageHeader
        title="Инструкция по обновлению сайта"
        subtitle="Как обновить сайт с SEO-оптимизацией после изменений в poehali.dev"
        icon="FileText"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={20} />
              Когда использовать
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              После каждого изменения контента или структуры сайта в poehali.dev необходимо обновить версию на хостинге.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ListOrdered" size={20} />
              Пошаговая инструкция
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Скачать изменения с GitHub
              </h3>
              <p className="text-muted-foreground mb-2">Откройте терминал (командную строку) и выполните:</p>
              <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                <code>cd C:\Windows\System32\hybrid24-site-analysis{'\n'}git pull</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Установить зависимости (опционально)
              </h3>
              <p className="text-muted-foreground mb-2">Только если добавлялись новые пакеты:</p>
              <pre className="bg-muted p-3 rounded-md">
                <code>bun install</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                Собрать проект
              </h3>
              <pre className="bg-muted p-3 rounded-md">
                <code>bun run build</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                Создать SEO-версии страниц
              </h3>
              <pre className="bg-muted p-3 rounded-md">
                <code>node prerender-puppeteer.js</code>
              </pre>
              <p className="text-muted-foreground mt-2 text-sm">
                Эта команда отрендерит все страницы с полным контентом для поисковиков
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                Загрузить на хостинг
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Откройте папку C:\Windows\System32\hybrid24-site-analysis\dist\</li>
                <li>Зайдите в панель управления хостингом</li>
                <li>Удалите все старые файлы на хостинге</li>
                <li>Загрузите всё содержимое папки dist/ на хостинг</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
                Проверить результат
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Откройте https://hybrid24.ru в браузере</li>
                <li>Нажмите Ctrl+Shift+R (жёсткое обновление)</li>
                <li>Нажмите Ctrl+U (просмотр исходного кода)</li>
                <li>Найдите текст "Профессиональный ремонт" — он должен быть в HTML</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">7</span>
                Уведомить поисковики
              </h3>
              <p className="text-muted-foreground mb-3">
                После загрузки на хостинг уведомите Google, Яндекс и Bing об обновлении sitemap:
              </p>
              <Button 
                onClick={handlePingSearchEngines} 
                disabled={isPinging}
                className="w-full sm:w-auto"
              >
                {isPinging ? (
                  <>
                    <Icon name="Loader" className="animate-spin mr-2" size={16} />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" className="mr-2" size={16} />
                    Уведомить поисковики
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Это ускорит переиндексацию обновлённых страниц
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Zap" size={20} />
              Быстрая шпаргалка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">Все команды подряд:</p>
            <pre className="bg-muted p-3 rounded-md overflow-x-auto">
              <code>
                cd C:\Windows\System32\hybrid24-site-analysis{'\n'}
                git pull{'\n'}
                bun run build{'\n'}
                node prerender-puppeteer.js
              </code>
            </pre>
            <p className="text-muted-foreground mt-3 text-sm">
              После этого загрузите содержимое папки <code className="bg-muted px-1 rounded">dist/</code> на хостинг.
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <Icon name="AlertTriangle" size={20} />
              Частые проблемы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">Ошибка: "Cannot find module"</p>
              <p className="text-sm text-muted-foreground">Решение: Запустите <code className="bg-muted px-1 rounded">bun install</code></p>
            </div>
            <div>
              <p className="font-medium">Сайт показывает старую версию</p>
              <p className="text-sm text-muted-foreground">Решение: Очистите кеш браузера (Ctrl+Shift+R)</p>
            </div>
            <div>
              <p className="font-medium">На хостинге нет контента</p>
              <p className="text-sm text-muted-foreground">Решение: Убедитесь, что запустили <code className="bg-muted px-1 rounded">node prerender-puppeteer.js</code> ДО загрузки</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-500">
              <Icon name="CheckCircle" size={20} />
              Важно помнить
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Icon name="Check" size={16} className="mt-1 flex-shrink-0 text-green-600" />
                <span>Всегда запускайте <code className="bg-muted px-1 rounded">git pull</code> перед сборкой</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={16} className="mt-1 flex-shrink-0 text-green-600" />
                <span>Не пропускайте команду <code className="bg-muted px-1 rounded">node prerender-puppeteer.js</code></span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={16} className="mt-1 flex-shrink-0 text-green-600" />
                <span>Удаляйте старые файлы на хостинге перед загрузкой новых</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>⏱️ Время выполнения: 2-3 минуты</p>
          <p>🔄 Частота обновления: После каждого изменения контента в poehali.dev</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSeoGuidePage;