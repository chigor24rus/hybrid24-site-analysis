import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '@/components/ui/icon';
import { SITE_CONFIG } from '@/config/site';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": `${SITE_CONFIG.domain}/`
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        ...(item.path && { "item": `${SITE_CONFIG.domain}${item.path}` })
      }))
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      <nav className={`flex items-center space-x-2 text-sm mb-6 overflow-x-auto ${className || 'text-muted-foreground'}`} aria-label="Breadcrumb">
        <Link 
          to="/" 
          className={`transition-colors flex items-center gap-1 whitespace-nowrap ${className ? 'hover:text-white' : 'hover:text-foreground'}`}
        >
          <Icon name="Home" size={16} />
          <span>Главная</span>
        </Link>
        
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Icon name="ChevronRight" size={14} className={className ? 'text-white/50' : 'text-muted-foreground/50'} />
            {item.path ? (
              <Link 
                to={item.path} 
                className={`transition-colors whitespace-nowrap ${className ? 'hover:text-white' : 'hover:text-foreground'}`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={`font-medium whitespace-nowrap ${className ? 'text-white' : 'text-foreground'}`} aria-current="page">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}