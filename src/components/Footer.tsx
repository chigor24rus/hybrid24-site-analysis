import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const Footer = () => {
  return (
    <footer className="border-t border-border py-8 md:py-12" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <img 
              src="https://cdn.poehali.dev/files/3d75c71d-b131-4e61-ab96-350ab118a033.png" 
              alt="HEVSeRvice" 
              className="h-10 w-auto mb-4"
              loading="lazy"
            />
            <p className="text-muted-foreground text-sm mb-4">
              Профессиональный автосервис в Красноярске
            </p>
            <div className="flex flex-wrap gap-3">
              <img 
                src="https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/bucket/91f44172-a46c-4899-8c17-f1a748095476.png"
                alt="Премия 2GIS"
                className="h-8"
                loading="lazy"
              />
              <img 
                src="https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/bucket/d58ce515-5eb6-42f7-9f05-60cf45585b03.png"
                alt="Хорошее место 2026"
                className="h-8"
                loading="lazy"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Навигация</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Главная
              </Link>
              <Link to="/promotions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Акции
              </Link>
              <Link to="/reviews" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Отзывы
              </Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Блог
              </Link>
              <Link to="/brands" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Бренды
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Информация</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                О нас
              </Link>
              {/* <Link to="/bonus-program" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Бонусная программа
              </Link> */}
              {/* <Link to="/warranty" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Гарантия
              </Link> */}
              <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Правовая информация
              </Link>
              <a 
                href="https://functions.poehali.dev/bfb45887-88df-472e-86be-950f37a57385" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Карта сайта
              </a>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Контакты</h3>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a href="tel:+79230166750" className="hover:text-foreground transition-colors flex items-center gap-2">
                <Icon name="Phone" size={16} />
                +7 (923) 016-67-50
              </a>
              <a href="mailto:info@hybrid24.ru" className="hover:text-foreground transition-colors flex items-center gap-2">
                <Icon name="Mail" size={16} />
                info@hybrid24.ru
              </a>
              <p className="flex items-start gap-2">
                <Icon name="MapPin" size={16} className="mt-0.5 flex-shrink-0" />
                ул. Водопьянова, д. 1К, Красноярск
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs sm:text-sm text-center">
            © 2025 HEVSR. Все права защищены
          </p>
          <div className="flex gap-4" role="navigation" aria-label="Социальные сети">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-12 w-12 p-0 hover:bg-primary/10" 
              aria-label="Telegram"
              asChild
            >
              <a href="https://t.me/HybridS24bot" target="_blank" rel="noopener noreferrer">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </a>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-12 w-12 p-0 hover:bg-primary/10" 
              aria-label="ВКонтакте"
              asChild
            >
              <a href="https://vk.ru/hybrid24" target="_blank" rel="noopener noreferrer">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.38 12.95c.29.31.6.62.86.96.11.15.22.3.31.47.12.24.01.51-.2.52l-1.68.01c-.34.03-.61-.11-.83-.36-.18-.2-.34-.42-.51-.63-.07-.09-.14-.17-.23-.24-.16-.13-.3-.1-.39.07-.09.17-.11.36-.12.54-.02.27-.09.34-.36.36-.58.03-1.13-.06-1.65-.32-.46-.23-.83-.56-1.15-.96-.62-.76-1.09-1.61-1.51-2.49-.08-.18-.02-.27.17-.28.32-.01.64-.01.96 0 .15 0 .25.09.31.23.24.54.54 1.05.93 1.5.1.12.2.24.33.33.15.1.26.07.33-.1.04-.11.06-.22.07-.33.03-.38.03-.76-.01-1.13-.02-.2-.13-.33-.33-.37-.1-.02-.08-.06-.04-.11.09-.11.17-.18.33-.18h1.26c.21.04.26.14.29.35v1.48c0 .08.04.33.19.39.12.04.2-.06.27-.13.33-.37.57-.8.78-1.25.09-.19.17-.38.24-.58.05-.13.13-.19.28-.19h1.78c.05 0 .11 0 .16.01.21.03.27.13.21.33-.09.34-.29.63-.48.91-.2.3-.42.59-.62.89-.18.26-.17.39.03.61z"/>
                </svg>
              </a>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-12 w-12 p-0 hover:bg-primary/10" 
              aria-label="Одноклассники"
              asChild
            >
              <a href="https://ok.ru/group/70000004972584" target="_blank" rel="noopener noreferrer">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4.5c1.52 0 2.75 1.23 2.75 2.75S13.52 12 12 12s-2.75-1.23-2.75-2.75S10.48 6.5 12 6.5zm3.63 7.44c-.59.42-1.34.73-2.18.88.61.47 1.43 1.2 2.03 1.79.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0-.51-.51-1.39-1.35-2.07-1.92-.68.57-1.56 1.41-2.07 1.92-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41.6-.59 1.42-1.32 2.03-1.79-.84-.15-1.59-.46-2.18-.88-.48-.34-.59-1-.25-1.48.34-.48 1-.59 1.48-.25.73.52 1.64.83 2.63.83s1.9-.31 2.63-.83c.48-.34 1.14-.23 1.48.25.34.48.23 1.14-.25 1.48z"/>
                </svg>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;