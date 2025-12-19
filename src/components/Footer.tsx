import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Footer = () => {
  return (
    <footer className="border-t border-border py-6 md:py-8" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img 
              src="https://cdn.poehali.dev/files/3d75c71d-b131-4e61-ab96-350ab118a033.png" 
              alt="HEVSeRvice" 
              className="h-8 sm:h-10 w-auto"
            />
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm text-center">© 2025 Все права защищены</p>
          <div className="flex gap-2 sm:gap-3" role="navigation" aria-label="Социальные сети">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Instagram">
              <Icon name="Instagram" size={18} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Facebook">
              <Icon name="Facebook" size={18} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Youtube">
              <Icon name="Youtube" size={18} />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;