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
    <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Zap" className="text-primary" size={32} />
          <span className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">AutoService</span>
        </div>

        <nav className="hidden md:flex gap-6">
          {navItems.map(item => (
            <a 
              key={item.href}
              href={item.href} 
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary btn-glow hidden md:flex">
                Записаться
              </Button>
            </DialogTrigger>
          </Dialog>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Icon name="Menu" size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Icon name="Zap" className="text-primary" size={24} />
                  <span className="gradient-primary bg-clip-text text-transparent">AutoService</span>
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
                  Записаться
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
    </header>
  );
};

export default Header;
