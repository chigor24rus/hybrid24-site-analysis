import { useState, useEffect } from 'react';
import {
  AdminLayout,
  LoadingScreen,
  AdminPageHeader,
  AdminStatsGrid,
  AdminStat,
  AdminActionButton,
} from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { API_ENDPOINTS } from '@/utils/apiClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Subscriber {
  id: number;
  email: string;
  created_at: string;
  is_active: boolean;
}

const AdminSubscribersPage = () => {
  const { logout } = useAdminAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.promotions.subscribers);
      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch {
      toast.error('Ошибка загрузки подписчиков');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleAction = async (id: number, action: 'activate' | 'deactivate' | 'delete') => {
    if (action === 'delete' && !confirm('Удалить подписчика?')) return;
    try {
      await fetch(API_ENDPOINTS.promotions.subscribers, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      toast.success(
        action === 'delete' ? 'Подписчик удалён' :
        action === 'activate' ? 'Подписчик активирован' : 'Подписчик отписан'
      );
      fetchSubscribers();
    } catch {
      toast.error('Ошибка операции');
    }
  };

  if (loading) return <LoadingScreen />;

  const active = subscribers.filter(s => s.is_active);
  const inactive = subscribers.filter(s => !s.is_active);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <AdminPageHeader
            title="Подписчики на акции"
            description="Список клиентов, подписавшихся на уведомления об акциях"
            showBackButton
            actions={
              <>
                <AdminActionButton icon="RefreshCw" label="Обновить" onClick={fetchSubscribers} />
                <AdminActionButton icon="LogOut" label="Выйти" onClick={logout} variant="outline" />
              </>
            }
          />

          <AdminStatsGrid cols={3}>
            <AdminStat label="Всего подписчиков" value={subscribers.length} icon="Users" color="primary" />
            <AdminStat label="Активные" value={active.length} icon="Bell" color="success" />
            <AdminStat label="Отписавшиеся" value={inactive.length} icon="BellOff" color="muted" />
          </AdminStatsGrid>

          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Дата подписки</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Статус</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-muted-foreground">
                        <Icon name="Users" size={40} className="mx-auto mb-3 opacity-30" />
                        <p>Подписчиков пока нет</p>
                      </td>
                    </tr>
                  )}
                  {subscribers.map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{s.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.created_at}</td>
                      <td className="px-4 py-3">
                        {s.is_active ? (
                          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                            <Icon name="Bell" size={12} className="mr-1" /> Активен
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Icon name="BellOff" size={12} className="mr-1" /> Отписан
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {s.is_active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(s.id, 'deactivate')}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Icon name="BellOff" size={14} className="mr-1" />
                              Отписать
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(s.id, 'activate')}
                              className="text-primary hover:text-primary"
                            >
                              <Icon name="Bell" size={14} className="mr-1" />
                              Активировать
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(s.id, 'delete')}
                            className="text-destructive hover:text-destructive"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscribersPage;
