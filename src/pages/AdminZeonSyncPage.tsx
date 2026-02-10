import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { 
  AdminLayout, 
  LoadingScreen, 
  AdminPageHeader,
  ZeonSyncStats,
  ZeonSyncDiagnostics,
  ZeonSyncControls,
  ZeonSyncTable
} from '@/components/admin';
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
  const [syncingAmi, setSyncingAmi] = useState(false);
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

  const triggerAmiSync = async (skipFtp = false) => {
    setSyncingAmi(true);
    try {
      const params = new URLSearchParams();
      if (skipFtp) params.append('skip_ftp', 'true');
      if (syncDate) params.append('date', syncDate);
      params.append('limit', '50');
      
      const url = `https://functions.poehali.dev/86e16b48-8b61-4edb-989a-385cfae159f6?${params}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        alert(`Ошибка запуска AMI синхронизации: ${response.status}\n${errorText}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert(`AMI синхронизация завершена!\nПеренесено: ${data.synced}\nПропущено: ${data.skipped}\nНайдено файлов: ${data.total_found}`);
        fetchLogs();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      console.error('Error triggering AMI sync:', error);
      alert(`Ошибка при запуске AMI синхронизации: ${error}`);
    } finally {
      setSyncingAmi(false);
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

          {stats && (
            <ZeonSyncStats 
              stats={stats} 
              formatFileSize={formatFileSize} 
              formatDate={formatDate} 
            />
          )}

          {diagnostics && (
            <ZeonSyncDiagnostics diagnostics={diagnostics} />
          )}

          <ZeonSyncControls
            searchPhone={searchPhone}
            setSearchPhone={setSearchPhone}
            filterDateFrom={filterDateFrom}
            setFilterDateFrom={setFilterDateFrom}
            filterDateTo={filterDateTo}
            setFilterDateTo={setFilterDateTo}
            syncDate={syncDate}
            setSyncDate={setSyncDate}
            syncing={syncing}
            triggerSync={triggerSync}
            syncingAmi={syncingAmi}
            triggerAmiSync={triggerAmiSync}
            deleteFrom={deleteFrom}
            setDeleteFrom={setDeleteFrom}
            deleteTo={deleteTo}
            setDeleteTo={setDeleteTo}
            deleting={deleting}
            deleteRecordings={deleteRecordings}
            diagnosing={diagnosing}
            runDiagnostics={runDiagnostics}
            setPage={setPage}
          />

          <ZeonSyncTable
            recordings={recordings}
            stats={stats}
            page={page}
            limit={limit}
            setPage={setPage}
            formatDate={formatDate}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminZeonSyncPage;