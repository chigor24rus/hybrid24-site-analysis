import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { AdminLayout, LoadingScreen, AdminPageHeader } from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
}

interface Stats {
  total_recordings: number;
  total_size: number;
  last_sync: string | null;
  first_sync: string | null;
}

const AdminZeonSyncPage = () => {
  const { logout } = useAdminAuth();
  const [recordings, setRecordings] = useState<SyncRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, searchPhone]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });

      if (searchPhone) {
        params.append('phone', searchPhone);
      }

      const response = await fetch(
        `https://functions.poehali.dev/GET_ZEON_LOGS_URL?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setRecordings(data.recordings);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/ZEON_CRON_URL?action=trigger'
      );
      const data = await response.json();

      if (data.success) {
        alert(`Синхронизация завершена!\nПеренесено: ${data.result.synced}\nПропущено: ${data.result.skipped}`);
        fetchLogs();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
      alert('Ошибка при запуске синхронизации');
    } finally {
      setSyncing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU');
  };

  if (loading && recordings.length === 0) return <LoadingScreen />;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <AdminPageHeader
            title="Синхронизация ZEON → FTP"
            description="Мониторинг переноса записей звонков"
            showBackButton
            actions={
              <Button onClick={logout} variant="outline">
                <Icon name="LogOut" className="mr-2" size={16} />
                Выйти
              </Button>
            }
          />

          {/* Статистика */}
          {stats && (
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
          )}

          {/* Панель управления */}
          <div className="bg-card border rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Поиск по номеру телефона..."
                  value={searchPhone}
                  onChange={(e) => {
                    setSearchPhone(e.target.value);
                    setPage(0);
                  }}
                  className="w-full"
                />
              </div>
              <Button onClick={triggerSync} disabled={syncing}>
                <Icon
                  name={syncing ? 'Loader2' : 'RefreshCw'}
                  className={`mr-2 ${syncing ? 'animate-spin' : ''}`}
                  size={16}
                />
                {syncing ? 'Синхронизация...' : 'Запустить синхронизацию'}
              </Button>
            </div>
          </div>

          {/* Таблица записей */}
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
                        {formatDate(record.synced_at)}
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

            {/* Пагинация */}
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminZeonSyncPage;
