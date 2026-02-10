import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface ZeonSyncControlsProps {
  searchPhone: string;
  setSearchPhone: (value: string) => void;
  filterDateFrom: string;
  setFilterDateFrom: (value: string) => void;
  filterDateTo: string;
  setFilterDateTo: (value: string) => void;
  syncDate: string;
  setSyncDate: (value: string) => void;
  syncing: boolean;
  triggerSync: (skipFtp: boolean) => void;
  syncingAmi: boolean;
  triggerAmiSync: (skipFtp: boolean) => void;
  deleteFrom: string;
  setDeleteFrom: (value: string) => void;
  deleteTo: string;
  setDeleteTo: (value: string) => void;
  deleting: boolean;
  deleteRecordings: (deleteFromSftp: boolean) => void;
  diagnosing: boolean;
  runDiagnostics: () => void;
  setPage: (page: number) => void;
}

export const ZeonSyncControls = ({
  searchPhone,
  setSearchPhone,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  syncDate,
  setSyncDate,
  syncing,
  triggerSync,
  syncingAmi,
  triggerAmiSync,
  deleteFrom,
  setDeleteFrom,
  deleteTo,
  setDeleteTo,
  deleting,
  deleteRecordings,
  diagnosing,
  runDiagnostics,
  setPage,
}: ZeonSyncControlsProps) => {
  return (
    <div className="bg-card border rounded-lg p-6 mb-8">
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Фильтры просмотра</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Телефон</label>
              <Input
                placeholder="Поиск по номеру..."
                value={searchPhone}
                onChange={(e) => {
                  setSearchPhone(e.target.value);
                  setPage(0);
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">С даты</label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => {
                  setFilterDateFrom(e.target.value);
                  setPage(0);
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">По дату</label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => {
                  setFilterDateTo(e.target.value);
                  setPage(0);
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Синхронизация через REST API</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">Дата для синхронизации (необязательно)</label>
              <Input
                type="date"
                placeholder="Оставьте пустым для последних 7 дней"
                value={syncDate}
                onChange={(e) => setSyncDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => triggerSync(true)} disabled={syncing} variant="outline">
                <Icon
                  name={syncing ? 'Loader2' : 'Database'}
                  className={`mr-2 ${syncing ? 'animate-spin' : ''}`}
                  size={16}
                />
                Только БД
              </Button>
              <Button onClick={() => triggerSync(false)} disabled={syncing}>
                <Icon
                  name={syncing ? 'Loader2' : 'RefreshCw'}
                  className={`mr-2 ${syncing ? 'animate-spin' : ''}`}
                  size={16}
                />
                БД + FTP
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Синхронизация через AMI (с оригинальными именами)</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">Дата для синхронизации (необязательно)</label>
              <Input
                type="date"
                placeholder="Оставьте пустым для всех файлов"
                value={syncDate}
                onChange={(e) => setSyncDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => triggerAmiSync(true)} disabled={syncingAmi} variant="outline">
                <Icon
                  name={syncingAmi ? 'Loader2' : 'Database'}
                  className={`mr-2 ${syncingAmi ? 'animate-spin' : ''}`}
                  size={16}
                />
                AMI: Только БД
              </Button>
              <Button onClick={() => triggerAmiSync(false)} disabled={syncingAmi}>
                <Icon
                  name={syncingAmi ? 'Loader2' : 'Server'}
                  className={`mr-2 ${syncingAmi ? 'animate-spin' : ''}`}
                  size={16}
                />
                AMI: БД + FTP
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Удаление записей за период</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">С даты</label>
              <Input
                type="date"
                value={deleteFrom}
                onChange={(e) => setDeleteFrom(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">По дату</label>
              <Input
                type="date"
                value={deleteTo}
                onChange={(e) => setDeleteTo(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-2">
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
        </div>
        
        <div className="border-t pt-6">
          <Button onClick={runDiagnostics} disabled={diagnosing} variant="outline">
            <Icon
              name={diagnosing ? 'Loader2' : 'Stethoscope'}
              className={`mr-2 ${diagnosing ? 'animate-spin' : ''}`}
              size={16}
            />
            {diagnosing ? 'Проверка...' : 'Диагностика подключения'}
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
  );
};