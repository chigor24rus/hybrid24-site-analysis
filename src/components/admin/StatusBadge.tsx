import { Badge } from '@/components/ui/badge';

type StatusType = 'booking' | 'error' | 'log';

interface StatusConfig {
  colors: Record<string, string>;
  labels: Record<string, string>;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  booking: {
    colors: {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    },
    labels: {
      new: 'Новая',
      confirmed: 'Подтверждена',
      completed: 'Завершена',
      cancelled: 'Отменена',
    },
  },
  error: {
    colors: {
      error: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    labels: {
      error: 'Ошибка',
      warning: 'Предупреждение',
      info: 'Информация',
    },
  },
  log: {
    colors: {
      frontend: 'bg-blue-100 text-blue-800 border-blue-200',
      backend: 'bg-green-100 text-green-800 border-green-200',
    },
    labels: {
      frontend: 'Frontend',
      backend: 'Backend',
    },
  },
};

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
}

export const StatusBadge = ({ status, type = 'booking' }: StatusBadgeProps) => {
  const config = statusConfigs[type];
  const colorClass = config.colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  const label = config.labels[status] || status;

  return (
    <Badge variant="outline" className={colorClass}>
      {label}
    </Badge>
  );
};