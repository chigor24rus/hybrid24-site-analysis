const advantages = [
  {
    title: 'Большой опыт с гибридными и электрическими установками.',
    desc: 'Ремонтируем гибридные и электрические автомобили с 2010 года.',
    highlight: true,
  },
  {
    title: 'Высококвалифицированный персонал.',
    desc: 'Повышение квалификации в лучших учебных центрах.',
    highlight: true,
  },
  {
    title: 'Высокотехнологичное современное оборудование.',
    desc: '',
    highlight: false,
  },
  {
    title: 'Сертификация от производителей запасных частей.',
    desc: '',
    highlight: false,
  },
  {
    title: 'Гарантия, предоставляемая на все услуги и запчасти.',
    desc: 'Многоступенчатый контроль выполнения работ. Оригинальные запчасти. Гарантия на контрактные запчасти.',
    highlight: true,
  },
  {
    title: 'Комфортная зона ожидания.',
    desc: '',
    highlight: false,
  },
  {
    title: 'Возможность контролировать процесс ремонта.',
    desc: '',
    highlight: false,
  },
  {
    title: 'Все посты оснащены видеокамерами, выполняется стопроцентный видеоконтроль.',
    desc: '',
    highlight: false,
  },
];

const AdvantagesSection = () => {
  return (
    <section className="py-12 md:py-20 lg:py-28 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://cdn.poehali.dev/files/2025-12-13_14-19-48.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/60 to-black/80" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Левая колонка — преимущества */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Наши преимущества</h2>
            <ul className="space-y-4">
              {advantages.map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  <div>
                    <span className={item.highlight ? 'text-white font-semibold text-base md:text-lg' : 'text-gray-200 text-sm md:text-base'}>
                      {item.title}
                    </span>
                    {item.desc && (
                      <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Правая колонка — текст */}
          <div className="lg:pl-8">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Современные технологии, гарантия сервиса.</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Доверяйте профессионалам!
            </h2>
            <p className="text-gray-200 text-base md:text-lg mb-4">
              Первый специализированный сервис по ремонту и обслуживанию гибридных и электрических автомобилей.
            </p>
            <p className="text-gray-300 text-base md:text-lg">
              Мы ремонтируем и обслуживаем любые автомобили, но очень любим гибридные!
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
