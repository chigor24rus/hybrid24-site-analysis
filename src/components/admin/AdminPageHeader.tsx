import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminIconButton } from './AdminActionButton';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  showBackButton?: boolean;
  backPath?: string;
}

export const AdminPageHeader = ({ 
  title, 
  description, 
  actions,
  showBackButton = false,
  backPath = '/admin'
}: AdminPageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <AdminIconButton
              icon="ArrowLeft"
              onClick={() => navigate(backPath)}
              variant="outline"
            />
          )}
          <div>
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};