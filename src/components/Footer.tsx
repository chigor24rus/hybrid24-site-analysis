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
            />
            <p className="text-muted-foreground text-sm">
              Профессиональный автосервис в Красноярске
            </p>
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
              <Link to="/bonus-program" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Бонусная программа
              </Link>
              <Link to="/warranty" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Гарантия
              </Link>
              <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Правовая информация
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Контакты</h3>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a href="tel:+79230166750" className="hover:text-foreground transition-colors flex items-center gap-2">
                <Icon name="Phone" size={16} />
                +7 (923) 016-67-50
              </a>
              <a href="mailto:info@hybrids24.ru" className="hover:text-foreground transition-colors flex items-center gap-2">
                <Icon name="Mail" size={16} />
                info@hybrids24.ru
              </a>
              <p className="flex items-start gap-2">
                <Icon name="MapPin" size={16} className="mt-0.5 flex-shrink-0" />
                ул. Водопьянова, д. 1К, Красноярск
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex justify-center items-center">
          <p className="text-muted-foreground text-xs sm:text-sm text-center">
            © 2025 HEVSeRvice. Все права защищены
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;