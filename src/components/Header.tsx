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
    { href: '#services', label: 'Услуги', isSection: true },
    { href: '/promotions', label: 'Акции', isSection: false },
    { href: '#reviews', label: 'Отзывы', isSection: true },
    { href: '#blog', label: 'Блог', isSection: true },
    { href: '#brands', label: 'Бренды', isSection: true },
    { href: '#contacts', label: 'Контакты', isSection: true }
  ];

  const handleNavClick = (e: React.MouseEvent, href: string, isSection: boolean) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (isSection) {
      // If it's a section link and we're not on home page, navigate to home first
      if (location.pathname !== '/') {
        navigate('/' + href);
      } else {
        // If on home page, just scroll to section
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      // If it's a page link, navigate to it
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
    >
      <div className="backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 logo-glow">
            <img 
              src="https://cdn.poehali.dev/files/3d75c71d-b131-4e61-ab96-350ab118a033.png" 
              alt="HEVSR" 
              className="h-10 sm:h-12 md:h-16 w-auto bg-white/90 rounded-lg p-2"
            />
          </Link>

          <nav className="hidden lg:flex gap-8 items-center">
            {navItems.map(item => (
              <a 
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href, item.isSection)}
                className="hover:text-primary transition-colors text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
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
                <Button variant="ghost" size="icon" className="lg:hidden">
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
                        className="h-10 w-auto bg-white/90 rounded-lg p-2"
                      />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map(item => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href, item.isSection)}
                      className="text-lg hover:text-primary transition-colors py-2"
                    >
                      {item.label}
                    </a>
                  ))}
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