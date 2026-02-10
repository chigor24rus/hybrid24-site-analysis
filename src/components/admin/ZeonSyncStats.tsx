interface Stats {
  total_recordings: number;
  total_size: number;
  last_sync: string | null;
  first_sync: string | null;
}

interface ZeonSyncStatsProps {
  stats: Stats;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateStr: string) => string;
}

export const ZeonSyncStats = ({ stats, formatFileSize, formatDate }: ZeonSyncStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-card border rounded-lg p-6">
        <div className="text-muted-foreground text-sm mb-1">
          Всего записей
        </div>
        <div className="text-3xl font-bold">
          {stats.total_recordings.toLocaleString()}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="text-muted-foreground text-sm mb-1">
          Общий размер
        </div>
        <div className="text-3xl font-bold">
          {formatFileSize(stats.total_size || 0)}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="text-muted-foreground text-sm mb-1">
          Последняя синхронизация
        </div>
        <div className="text-sm font-medium">
          {stats.last_sync ? formatDate(stats.last_sync) : 'Нет данных'}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="text-muted-foreground text-sm mb-1">
          Первая синхронизация
        </div>
        <div className="text-sm font-medium">
          {stats.first_sync ? formatDate(stats.first_sync) : 'Нет данных'}
        </div>
      </div>
    </div>
  );
};
