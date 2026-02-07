import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const AdminActionButton = ({
  icon,
  label,
  onClick,
  variant = 'outline',
  disabled = false,
  loading = false,
  className = ''
}: AdminActionButtonProps) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <Icon name="Loader" className="mr-2 animate-spin" size={18} />
      ) : (
        <Icon name={icon as any} className="mr-2" size={18} />
      )}
      {label}
    </Button>
  );
};

interface AdminIconButtonProps {
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  tooltip?: string;
  className?: string;
}

export const AdminIconButton = ({
  icon,
  onClick,
  variant = 'outline',
  size = 'sm',
  disabled = false,
  tooltip,
  className = ''
}: AdminIconButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
      title={tooltip}
    >
      <Icon name={icon as any} size={16} />
    </Button>
  );
};
