import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MaintenancePage = () => {
  const [endTime, setEndTime] = useState<string | null>(null);

  useEffect(() => {
    const savedEndTime = localStorage.getItem('maintenanceEndTime');
    if (savedEndTime) {
      setEndTime(savedEndTime);
    }
  }, []);

  const formatEndTime = (datetime: string) => {
    try {
      const date = new Date(datetime);
      return format(date, 'd MMMM в HH:mm', { locale: ru });
    } catch {
      return datetime;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <Icon name="Wrench" className="mx-auto text-yellow-500 mb-6" size={80} />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Сайт находится на обслуживании
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6">
            Мы проводим технические работы для улучшения качества обслуживания.<br />
            {endTime ? (
              <>Планируемое время окончания: <span className="font-semibold text-yellow-400">{formatEndTime(endTime)}</span></>
            ) : (
              <>Пожалуйста, зайдите позже.</>
            )}
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <p className="text-white mb-4 font-semibold">
              Для срочных вопросов свяжитесь с нами:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30" asChild>
                <a href="tel:+79230166750">
                  <Icon name="Phone" className="mr-2" size={20} />
                  +7 (923) 016-67-50
                </a>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30" asChild>
                <a href="mailto:info@hybrids24.ru">
                  <Icon name="Mail" className="mr-2" size={20} />
                  info@hybrids24.ru
                </a>
              </Button>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Приносим извинения за временные неудобства
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;