import { useState } from 'react';
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

  const navItems = [
    { href: '#services', label: 'Услуги' },
    { href: '#promotions', label: 'Акции' },
    { href: '#reviews', label: 'Отзывы' },
    { href: '#blog', label: 'Блог' }
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img 
              src="https://cdn.poehali.dev/files/b809df5f-2020-472d-988b-5edd2cd86b69.png" 
              alt="HEVSR" 
              className="h-8 sm:h-10 md:h-12 w-auto"
            />
          </div>

          <nav className="hidden lg:flex gap-8 items-center">
            {navItems.map(item => (
              <a 
                key={item.href}
                href={item.href} 
                className="hover:text-primary transition-colors text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a 
              href="tel:+79230166750" 
              className="hidden sm:flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Icon name="Phone" size={20} className="text-primary" />
              <span className="font-semibold text-sm md:text-base">+7 (923) 016-67-50</span>
            </a>

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
                  <SheetTitle className="flex items-center gap-2">
                    <img 
                      src="https://cdn.poehali.dev/files/b809df5f-2020-472d-988b-5edd2cd86b69.png" 
                      alt="HEVSR" 
                      className="h-8 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map(item => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => handleNavClick(item.href)}
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