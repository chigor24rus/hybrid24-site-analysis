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
  call_date?: string;
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
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Record<string, { status: string; message: string }> | null>(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [syncDate, setSyncDate] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [deleteFrom, setDeleteFrom] = useState('');
  const [deleteTo, setDeleteTo] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, searchPhone, filterDateFrom, filterDateTo]);

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

      if (filterDateFrom) {
        params.append('date_from', filterDateFrom);
      }

      if (filterDateTo) {
        params.append('date_to', filterDateTo);
      }

      const response = await fetch(
        `https://functions.poehali.dev/a92e76a2-b78a-4c7c-8411-ea8764ff63be?${params}`
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

  const runDiagnostics = async () => {
    setDiagnosing(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/bab0230b-9e57-4664-85c1-09f5fafa35de'
      );
      const data = await response.json();
      setDiagnostics(data.results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      alert(`Ошибка диагностики: ${error}`);
    } finally {
      setDiagnosing(false);
    }
  };

  const deleteRecordings = async (deleteFromSftp = false) => {
    if (!deleteFrom || !deleteTo) {
      alert('Укажите период для удаления');
      return;
    }

    const confirmMsg = deleteFromSftp 
      ? `Удалить записи за период ${deleteFrom} - ${deleteTo} из БД И SFTP сервера?`
      : `Удалить записи за период ${deleteFrom} - ${deleteTo} только из БД?`;

    if (!confirm(confirmMsg)) return;

    setDeleting(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/0a0417d3-fbc0-4371-a24b-57eff0046ca1',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date_from: deleteFrom,
            date_to: deleteTo,
            delete_from_sftp: deleteFromSftp
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        alert(`Ошибка удаления: ${response.status}\n${errorText}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setDeleteFrom('');
        setDeleteTo('');
        fetchLogs();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting recordings:', error);
      alert(`Ошибка при удалении: ${error}`);
    } finally {
      setDeleting(false);
    }
  };

  const triggerSync = async (skipFtp = false) => {
    setSyncing(true);
    try {
      const params = new URLSearchParams();
      params.append('action', 'trigger');
      if (skipFtp) params.append('skip_ftp', 'true');
      if (syncDate) params.append('date', syncDate);
      
      const url = `https://functions.poehali.dev/9935542d-697a-4927-baa4-878149ece77d?${params}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        alert(`Ошибка запуска синхронизации: ${response.status}\n${errorText}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert(`Синхронизация завершена!\nПеренесено: ${data.result.synced}\nПропущено: ${data.result.skipped}`);
        fetchLogs();
      } else {
        alert(`Ошибка: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
      alert(`Ошибка при запуске синхронизации: ${error}`);
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
    // Конвертируем в часовой пояс Красноярска (UTC+7)
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', { 
      timeZone: 'Asia/Krasnoyarsk',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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

          {/* Диагностика */}
          {diagnostics && (
            <div className="bg-card border rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Результаты диагностики</h3>
              <div className="space-y-3">
                {Object.entries(diagnostics).map(([key, value]) => {
                  if (key === 'secrets') return null;
                  const statusIcon = value.status === 'ok' ? 'CheckCircle2' : value.status === 'warning' ? 'AlertCircle' : 'XCircle';
                  const statusColor = value.status === 'ok' ? 'text-green-600' : value.status === 'warning' ? 'text-yellow-600' : 'text-red-600';
                  
                  return (
                    <div key={key} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                      <Icon name={statusIcon} className={`mt-0.5 ${statusColor}`} size={20} />
                      <div className="flex-1">
                        <div className="font-medium capitalize">{key.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">{value.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Панель управления */}
          <div className="bg-card border rounded-lg p-6 mb-8">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
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
                <div>
                  <Input
                    type="date"
                    placeholder="Фильтр: с даты"
                    value={filterDateFrom}
                    onChange={(e) => {
                      setFilterDateFrom(e.target.value);
                      setPage(0);
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    placeholder="Фильтр: по дату"
                    value={filterDateTo}
                    onChange={(e) => {
                      setFilterDateTo(e.target.value);
                      setPage(0);
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    placeholder="Дата для синхронизации"
                    value={syncDate}
                    onChange={(e) => setSyncDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Удаление записей */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <Input
                    type="date"
                    placeholder="Удалить: с даты"
                    value={deleteFrom}
                    onChange={(e) => setDeleteFrom(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    placeholder="Удалить: по дату"
                    value={deleteTo}
                    onChange={(e) => setDeleteTo(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2 flex gap-2">
                  <Button 
                    onClick={() => deleteRecordings(false)} 
                    disabled={deleting || !deleteFrom || !deleteTo} 
                    variant="destructive"
                  >
                    <Icon
                      name={deleting ? 'Loader2' : 'Trash2'}
                      className={`mr-2 ${deleting ? 'animate-spin' : ''}`}
                      size={16}
                    />
                    Удалить из БД
                  </Button>
                  <Button 
                    onClick={() => deleteRecordings(true)} 
                    disabled={deleting || !deleteFrom || !deleteTo} 
                    variant="destructive"
                  >
                    <Icon
                      name={deleting ? 'Loader2' : 'Trash2'}
                      className={`mr-2 ${deleting ? 'animate-spin' : ''}`}
                      size={16}
                    />
                    Удалить из БД + SFTP
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={runDiagnostics} disabled={diagnosing} variant="outline">
                  <Icon
                    name={diagnosing ? 'Loader2' : 'Stethoscope'}
                    className={`mr-2 ${diagnosing ? 'animate-spin' : ''}`}
                    size={16}
                  />
                  {diagnosing ? 'Проверка...' : 'Диагностика'}
                </Button>
                <Button onClick={() => triggerSync(true)} disabled={syncing} variant="outline">
                  <Icon
                    name={syncing ? 'Loader2' : 'Database'}
                    className={`mr-2 ${syncing ? 'animate-spin' : ''}`}
                    size={16}
                  />
                  {syncing ? 'Синхронизация...' : 'Только БД'}
                </Button>
                <Button onClick={() => triggerSync(false)} disabled={syncing}>
                  <Icon
                    name={syncing ? 'Loader2' : 'RefreshCw'}
                    className={`mr-2 ${syncing ? 'animate-spin' : ''}`}
                    size={16}
                  />
                  {syncing ? 'Синхронизация...' : 'БД + FTP'}
                </Button>
              </div>
            </div>
            {syncDate && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-200">
                <Icon name="Info" size={16} className="inline mr-2" />
                Будут синхронизированы записи за {new Date(syncDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}
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