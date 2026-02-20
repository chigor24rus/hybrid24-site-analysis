import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';

interface HeaderProps {
  isBookingOpen: boolean;
  setIsBookingOpen: (open: boolean) => void;
}

const Header = ({ isBookingOpen, setIsBookingOpen }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { href: '/services', label: 'Услуги', isSection: false },
    { href: '/promotions', label: 'Акции', isSection: false },
    { href: '/reviews', label: 'Отзывы', isSection: false },
    { href: '/blog', label: 'Блог', isSection: false },
    { href: '/brands', label: 'Бренды', isSection: false },
    { href: '/#contacts', label: 'Контакты', isSection: true }
  ];

  const mobileExtraItems = [
    { href: '/about', label: 'О нас', isSection: false },
    // { href: '/bonus-program', label: 'Бонусная программа', isSection: false },
    // { href: '/warranty', label: 'Гарантия', isSection: false },
    { href: '/legal', label: 'Правовая информация', isSection: false }
  ];

  const handleNavClick = (e: React.MouseEvent, href: string, isSection: boolean) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (isSection) {
      const sectionId = href.includes('#') ? href.split('#')[1] : href.replace('#', '');
      
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: sectionId } });
      } else {
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header 
      className="border-b border-border sticky top-0 z-50 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://cdn.poehali.dev/files/690e89b6-5b7c-486e-a234-151943ca4841.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      role="banner"
    >
      <div className="backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 logo-glow">
            <img 
              src="https://cdn.poehali.dev/files/3d75c71d-b131-4e61-ab96-350ab118a033.png" 
              alt="HEVSR - Сертифицированная СТО в Красноярске" 
              className="h-10 sm:h-12 md:h-16 w-auto"
              fetchPriority="high"
            />
          </Link>

          <nav className="hidden lg:flex gap-8 items-center" role="navigation" aria-label="Основная навигация">
            {navItems.map(item => {
              const isActive = item.isSection 
                ? location.pathname === '/' && location.hash === item.href.split('#')[1]
                : location.pathname === item.href;
              
              return (
                <a 
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href, item.isSection)}
                  className={`hover:text-primary transition-colors text-sm font-medium ${
                    isActive ? 'text-primary font-semibold' : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              asChild
              className="gradient-primary btn-glow hidden sm:flex"
            >
              <a href="tel:+79230166750">
                <Icon name="Phone" size={20} />
                +7 (923) 016-67-50
              </a>
            </Button>

            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary btn-glow hidden md:flex">
                  Записаться на сервис
                </Button>
              </DialogTrigger>
            </Dialog>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden min-w-[44px] min-h-[44px]" aria-label="Открыть меню">
                  <Icon name="Menu" size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>
                    <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <img 
                        src="https://cdn.poehali.dev/files/3d75c71d-b131-4e61-ab96-350ab118a033.png" 
                        alt="HEVSR" 
                        className="h-10 w-auto"
                        loading="lazy"
                      />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map(item => {
                    const isActive = item.isSection 
                      ? location.pathname === '/' && location.hash === item.href.split('#')[1]
                      : location.pathname === item.href;
                    
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href, item.isSection)}
                        className={`text-lg hover:text-primary transition-colors py-3 min-h-[48px] flex items-center ${
                          isActive ? 'text-primary font-semibold border-l-2 border-primary pl-3' : ''
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                  
                  <div className="border-t border-border my-2 pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Информация</p>
                    {mobileExtraItems.map(item => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href, item.isSection)}
                        className="text-sm hover:text-primary transition-colors py-2 block"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                  
                  <Button 
                    className="gradient-primary btn-glow w-full mt-4" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsBookingOpen(true);
                    }}
                  >
                    Записаться на сервис
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    asChild
                  >
                    <a href="tel:+79230166750">
                      <Icon name="Phone" className="mr-2" size={18} />
                      +7 (923) 016-67-50
                    </a>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;