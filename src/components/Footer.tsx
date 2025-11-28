import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Footer = () => {
  return (
    <footer className="border-t border-border py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img 
              src="https://cdn.poehali.dev/files/b809df5f-2020-472d-988b-5edd2cd86b69.png" 
              alt="HEVSR" 
              className="h-6 sm:h-8 w-auto"
            />
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm text-center">© 2025 Все права защищены</p>
          <div className="flex gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Icon name="Instagram" size={18} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Icon name="Facebook" size={18} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Icon name="Youtube" size={18} />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;