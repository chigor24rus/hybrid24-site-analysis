import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 overflow-x-auto">
      <Link 
        to="/" 
        className="hover:text-foreground transition-colors flex items-center gap-1 whitespace-nowrap"
      >
        <Icon name="Home" size={16} />
        <span>Главная</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Icon name="ChevronRight" size={14} className="text-muted-foreground/50" />
          {item.path ? (
            <Link 
              to={item.path} 
              className="hover:text-foreground transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium whitespace-nowrap">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
