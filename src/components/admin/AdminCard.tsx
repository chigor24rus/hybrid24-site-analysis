import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  icon?: string;
  headerClassName?: string;
}

export const AdminCard = ({
  title,
  description,
  children,
  actions,
  className = '',
  icon,
  headerClassName = ''
}: AdminCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className={headerClassName}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {icon && <Icon name={icon as any} size={20} className="text-primary" />}
              <CardTitle>{title}</CardTitle>
            </div>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

interface AdminCardItemProps {
  label: string;
  value: ReactNode;
  icon?: string;
  className?: string;
}

export const AdminCardItem = ({ label, value, icon, className = '' }: AdminCardItemProps) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon && <Icon name={icon as any} size={14} />}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
};

interface AdminCardActionsProps {
  children: ReactNode;
  className?: string;
}

export const AdminCardActions = ({ children, className = '' }: AdminCardActionsProps) => {
  return <div className={`flex gap-2 pt-3 border-t ${className}`}>{children}</div>;
};
