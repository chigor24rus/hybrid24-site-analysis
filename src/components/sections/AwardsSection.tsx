import { Card } from '@/components/ui/card';

const AwardsSection = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Награды и достижения
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Мы гордимся признанием нашей работы ведущими сервисами
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Премия 2GIS</h3>
                <p className="text-4xl font-bold text-orange-600 mb-2">2025</p>
                <p className="text-muted-foreground">
                  Признание качества услуг и высоких оценок клиентов
                </p>
              </div>
            </div>
          </Card>

          <a 
            href="https://yandex.ru/maps/org/1803676550" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="p-8 text-center hover:shadow-lg transition-all group-hover:scale-105 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-orange-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center gap-6">
                <div className="w-32 h-32 flex items-center justify-center">
                  <img 
                    src="https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/bucket/ba42501a-c884-4291-a9b7-9a1b10a8ba5e.png"
                    alt="Хорошее место 2026"
                    className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Хорошее место</h3>
                  <p className="text-4xl font-bold text-red-600 mb-2">2026</p>
                  <p className="text-muted-foreground">
                    Награда Яндекс.Карт за отличный сервис и положительные отзывы
                  </p>
                </div>
              </div>
            </Card>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AwardsSection;