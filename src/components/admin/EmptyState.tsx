import Icon from '@/components/ui/icon';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon | string;
  title: string;
  description?: string;
}

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon 
        name={typeof icon === 'string' ? icon : icon.name} 
        className="text-muted-foreground mb-4" 
        size={64} 
      />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};
