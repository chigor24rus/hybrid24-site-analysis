import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SyncRecord {
  id: number;
  recording_id: string;
  call_id: string;
  phone_number: string;
  duration: number;
  file_name: string;
  file_size: number;
  synced_at: string;
  ftp_path: string;
  call_date?: string;
}

interface Stats {
  total_recordings: number;
  total_size: number;
  last_sync: string | null;
  first_sync: string | null;
}

interface ZeonSyncTableProps {
  recordings: SyncRecord[];
  stats: Stats | null;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  formatDate: (dateStr: string) => string;
  formatDuration: (seconds: number) => string;
  formatFileSize: (bytes: number) => string;
}

export const ZeonSyncTable = ({
  recordings,
  stats,
  page,
  limit,
  setPage,
  formatDate,
  formatDuration,
  formatFileSize,
}: ZeonSyncTableProps) => {
  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Дата/Время
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Телефон
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ID звонка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Длительность
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Размер
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Файл
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recordings.map((record) => (
              <tr key={record.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {record.call_date ? formatDate(record.call_date) : formatDate(record.synced_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {record.phone_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {record.call_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {formatDuration(record.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {formatFileSize(record.file_size)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="max-w-xs truncate" title={record.file_name}>
                    {record.file_name}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats && stats.total_recordings > limit && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Показано {page * limit + 1}-
            {Math.min((page + 1) * limit, stats.total_recordings)} из{' '}
            {stats.total_recordings}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <Icon name="ChevronLeft" size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * limit >= stats.total_recordings}
            >
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
