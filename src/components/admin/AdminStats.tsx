import { ReactNode } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdminStatProps {
  label: string;
  value: number | string;
  icon?: string;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  default: 'text-foreground',
  primary: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600'
};

export const AdminStat = ({
  label,
  value,
  icon,
  color = 'default',
  onClick,
  className = ''
}: AdminStatProps) => {
  return (
    <Card
      className={`${onClick ? 'cursor-pointer hover:border-primary transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardDescription className="text-xs">{label}</CardDescription>
            <CardTitle className={`text-2xl ${colorClasses[color]}`}>{value}</CardTitle>
          </div>
          {icon && <Icon name={icon as any} size={24} className="text-muted-foreground" />}
        </div>
      </CardHeader>
    </Card>
  );
};

interface AdminStatsGridProps {
  children: ReactNode;
  cols?: number;
  className?: string;
}

export const AdminStatsGrid = ({ children, cols = 5, className = '' }: AdminStatsGridProps) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-4 ${className}`}>
      {children}
    </div>
  );
};
