import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import DeleteBookingsDialog from '@/components/DeleteBookingsDialog';
import {
  AdminLayout,
  AdminPageHeader,
  StatusBadge,
  AdminStatsGrid,
  AdminStat,
  AdminCard,
  AdminCardItem,
  AdminCardActions,
  AdminActionButton,
  AdminIconButton
} from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { formatDate, formatDateTime } from '@/utils/dateFormatters';
import { API_ENDPOINTS } from '@/utils/apiClient';

interface Booking {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_type: string;
  car_brand: string;
  car_model: string;
  preferred_date: string | null;
  preferred_time: string;
  promotion: string;
  comment: string;
  status: string;
  created_at: string;
  updated_at: string;
  synced_to_1c: boolean;
  synced_to_1c_at: string | null;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [retrying1cId, setRetrying1cId] = useState<number | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'all'
        ? API_ENDPOINTS.bookings.list
        : `${API_ENDPOINTS.bookings.list}?status=${filterStatus}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const response = await fetch(API_ENDPOINTS.bookings.updateStatus, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: newStatus, updated_at: data.updated_at }
              : booking
          )
        );
      } else {
        alert(data.error || 'Ошибка при обновлении статуса');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRetry1c = async (bookingId: number) => {
    setRetrying1cId(bookingId);
    try {
      const response = await fetch(API_ENDPOINTS.bookings.retry1c, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = await response.json();
      if (data.success) {
        setBookings(prev =>
          prev.map(b =>
            b.id === bookingId ? { ...b, synced_to_1c: true, synced_to_1c_at: new Date().toISOString() } : b
          )
        );
      } else {
        alert(data.error || 'Не удалось передать в 1С');
      }
    } catch {
      alert('Ошибка при отправке в 1С');
    } finally {
      setRetrying1cId(null);
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  const handleExport = async (startDate?: string, endDate?: string) => {
    setExporting(true);
    try {
      const body: { status: string; start_date?: string; end_date?: string } = {
        status: filterStatus,
      };
      
      if (startDate && endDate) {
        body.start_date = startDate;
        body.end_date = endDate;
      }

      const response = await fetch(API_ENDPOINTS.bookings.export, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const blob = new Blob(
          [Uint8Array.from(atob(data.file), c => c.charCodeAt(0))],
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(data.error || 'Ошибка при экспорте заявок');
      }
    } catch (error) {
      console.error('Error exporting bookings:', error);
      alert('Ошибка при экспорте заявок');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      {loading && (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Icon name="Loader" className="animate-spin" size={48} />
        </div>
      )}
      {!loading && (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <AdminPageHeader
              title="Админ-панель"
              description="Управление заявками и контентом"
              actions={
                <>
                  <div className="w-full mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Действия с заявками</h3>
                    <div className="flex flex-wrap gap-2">
                      <AdminActionButton
                        icon="Download"
                        label="Экспорт в Excel"
                        onClick={() => handleExport()}
                        disabled={exporting || bookings.length === 0}
                        loading={exporting}
                        variant="outline"
                      />
                      <AdminActionButton
                        icon="Trash2"
                        label="Удалить заявки"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        variant="outline"
                      />
                    </div>
                  </div>

                  <div className="w-full mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Управление контентом</h3>
                    <div className="flex flex-wrap gap-2">
                      <AdminActionButton
                        icon="Car"
                        label="Автомобили"
                        onClick={() => navigate('/admin/vehicles')}
                      />
                      <AdminActionButton
                        icon="FileText"
                        label="Блог"
                        onClick={() => navigate('/admin/blog')}
                      />
                      <AdminActionButton
                        icon="Percent"
                        label="Акции"
                        onClick={() => navigate('/admin/promotions')}
                      />
                      <AdminActionButton
                        icon="Star"
                        label="Отзывы"
                        onClick={() => navigate('/admin/reviews')}
                      />
                      <AdminActionButton
                        icon="Bell"
                        label="Подписчики"
                        onClick={() => navigate('/admin/subscribers')}
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Система</h3>
                    <div className="flex flex-wrap gap-2">
                      <AdminActionButton
                        icon="Bug"
                        label="Логи ошибок"
                        onClick={() => navigate('/admin/logs')}
                        variant="outline"
                      />
                      <AdminActionButton
                        icon="Settings"
                        label="Настройки"
                        onClick={() => navigate('/admin/settings')}
                        variant="outline"
                      />
                      <AdminActionButton
                        icon="Database"
                        label="Тест 1С"
                        onClick={() => navigate('/admin/1c-test')}
                        variant="outline"
                      />
                      <AdminActionButton
                        icon="Phone"
                        label="ZEON Sync"
                        onClick={() => navigate('/admin/zeon-sync')}
                        variant="outline"
                      />
                      <AdminActionButton
                        icon="FileText"
                        label="SEO Инструкция"
                        onClick={() => navigate('/admin/seo-guide')}
                        variant="outline"
                      />
                      <AdminActionButton
                        icon="LogOut"
                        label="Выйти"
                        onClick={logout}
                        variant="outline"
                      />
                    </div>
                  </div>
                </>
              }
            />

            <AdminStatsGrid cols={5} className="mb-8">
              <AdminStat
                label="Всего заявок"
                value={getStatusCount('all')}
                onClick={() => setFilterStatus('all')}
              />
              <AdminStat
                label="Новые"
                value={getStatusCount('new')}
                color="primary"
                onClick={() => setFilterStatus('new')}
              />
              <AdminStat
                label="Подтверждены"
                value={getStatusCount('confirmed')}
                color="success"
                onClick={() => setFilterStatus('confirmed')}
              />
              <AdminStat
                label="Завершены"
                value={getStatusCount('completed')}
                onClick={() => setFilterStatus('completed')}
              />
              <AdminStat
                label="Отменены"
                value={getStatusCount('cancelled')}
                color="danger"
                onClick={() => setFilterStatus('cancelled')}
              />
            </AdminStatsGrid>

            {bookings.length === 0 ? (
              <AdminCard title="Нет заявок">
                <div className="py-8 text-center text-muted-foreground">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Заявок пока нет</p>
                </div>
              </AdminCard>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <AdminCard
                    key={booking.id}
                    title={booking.customer_name}
                    description={formatDateTime(booking.created_at)}
                    icon="User"
                    actions={
                      <div className="flex items-center gap-2">
                        {booking.synced_to_1c ? (
                          <span title={`Передано в 1С${booking.synced_to_1c_at ? ': ' + formatDateTime(booking.synced_to_1c_at) : ''}`} className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <Icon name="CheckCircle" size={14} />
                            1С
                          </span>
                        ) : (
                          <span title="Не передано в 1С" className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon name="Clock" size={14} />
                            1С
                          </span>
                        )}
                        <StatusBadge status={booking.status} />
                      </div>
                    }
                  >
                    <div className="space-y-3">
                      <AdminCardItem
                        icon="Phone"
                        label="Телефон"
                        value={
                          <a href={`tel:${booking.customer_phone}`} className="text-primary hover:underline">
                            {booking.customer_phone}
                          </a>
                        }
                      />
                      
                      {booking.customer_email && (
                        <AdminCardItem
                          icon="Mail"
                          label="Email"
                          value={
                            <a href={`mailto:${booking.customer_email}`} className="text-primary hover:underline">
                              {booking.customer_email}
                            </a>
                          }
                        />
                      )}
                      
                      <AdminCardItem
                        icon="Wrench"
                        label="Услуга"
                        value={booking.service_type}
                      />

                      {booking.promotion && (
                        <AdminCardItem
                          icon="Percent"
                          label="Акция"
                          value={booking.promotion}
                        />
                      )}
                      
                      <AdminCardItem
                        icon="Car"
                        label="Автомобиль"
                        value={`${booking.car_brand} ${booking.car_model}`}
                      />
                      
                      {booking.preferred_date && (
                        <AdminCardItem
                          icon="Calendar"
                          label="Дата и время"
                          value={`${formatDate(booking.preferred_date)}, ${booking.preferred_time}`}
                        />
                      )}
                      
                      {booking.comment && (
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground mb-1">Комментарий:</p>
                          <p className="text-sm">{booking.comment}</p>
                        </div>
                      )}

                      {!booking.synced_to_1c && (
                        <button
                          onClick={() => handleRetry1c(booking.id)}
                          disabled={retrying1cId === booking.id}
                          className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs border border-dashed border-amber-400 text-amber-600 hover:bg-amber-50 rounded-md py-1.5 transition-colors disabled:opacity-50"
                        >
                          <Icon name={retrying1cId === booking.id ? 'Loader2' : 'RefreshCw'} size={12} className={retrying1cId === booking.id ? 'animate-spin' : ''} />
                          {retrying1cId === booking.id ? 'Отправка...' : 'Повторить отправку в 1С'}
                        </button>
                      )}

                      <AdminCardActions>
                        <Select
                          value={booking.status}
                          onValueChange={(value) => handleStatusChange(booking.id, value)}
                          disabled={updatingId === booking.id}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Новая</SelectItem>
                            <SelectItem value="confirmed">Подтверждена</SelectItem>
                            <SelectItem value="completed">Завершена</SelectItem>
                            <SelectItem value="cancelled">Отменена</SelectItem>
                          </SelectContent>
                        </Select>
                      </AdminCardActions>
                    </div>
                  </AdminCard>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <DeleteBookingsDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={fetchBookings}
      />
    </AdminLayout>
  );
};

export default AdminPage;