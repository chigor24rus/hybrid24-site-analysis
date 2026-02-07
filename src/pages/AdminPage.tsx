import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import DeleteBookingsDialog from '@/components/DeleteBookingsDialog';
import { AdminLayout, AdminPageHeader, StatusBadge } from '@/components/admin';
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
  comment: string;
  status: string;
  created_at: string;
  updated_at: string;
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
              description="Управление заявками клиентов"
              actions={
                <>
            <Button variant="outline" onClick={() => handleExport()} disabled={exporting || bookings.length === 0}>
              {exporting ? (
                <Icon name="Loader" className="mr-2 animate-spin" size={18} />
              ) : (
                <Icon name="Download" className="mr-2" size={18} />
              )}
              Экспорт в Excel
            </Button>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)}>
              <Icon name="Trash2" className="mr-2" size={18} />
              Удалить заявки
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/vehicles')}>
              <Icon name="Car" className="mr-2" size={18} />
              Автомобили
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/blog')}>
              <Icon name="FileText" className="mr-2" size={18} />
              Блог
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/promotions')}>
              <Icon name="Percent" className="mr-2" size={18} />
              Акции
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/reviews')}>
              <Icon name="Star" className="mr-2" size={18} />
              Отзывы
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/logs')}>
              <Icon name="Bug" className="mr-2" size={18} />
              Логи ошибок
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/settings')}>
              <Icon name="Settings" className="mr-2" size={18} />
              Настройки
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/1c-test')}>
              <Icon name="Database" className="mr-2" size={18} />
              Тест 1С
            </Button>
            <Button variant="outline" onClick={logout}>
              <Icon name="LogOut" className="mr-2" size={18} />
              Выйти
            </Button>
                </>
              }
            />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterStatus('all')}>
            <CardHeader className="p-4">
              <CardDescription className="text-xs">Всего заявок</CardDescription>
              <CardTitle className="text-2xl">{getStatusCount('all')}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterStatus('new')}>
            <CardHeader className="p-4">
              <CardDescription className="text-xs">Новые</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{getStatusCount('new')}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterStatus('confirmed')}>
            <CardHeader className="p-4">
              <CardDescription className="text-xs">Подтверждены</CardDescription>
              <CardTitle className="text-2xl text-green-600">{getStatusCount('confirmed')}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterStatus('completed')}>
            <CardHeader className="p-4">
              <CardDescription className="text-xs">Завершены</CardDescription>
              <CardTitle className="text-2xl text-gray-600">{getStatusCount('completed')}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterStatus('cancelled')}>
            <CardHeader className="p-4">
              <CardDescription className="text-xs">Отменены</CardDescription>
              <CardTitle className="text-2xl text-red-600">{getStatusCount('cancelled')}</CardTitle>
            </CardHeader>
          </Card>
            </div>

            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Icon name="FolderOpen" className="mx-auto mb-4 text-muted-foreground" size={64} />
                  <p className="text-xl font-semibold mb-2">Заявок нет</p>
                  <p className="text-muted-foreground">
                    {filterStatus === 'all' ? 'Пока не поступило ни одной заявки' : 'Нет заявок с выбранным статусом'}
                  </p>
                </CardContent>
              </Card>
            ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{booking.customer_name}</h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <StatusBadge status={booking.status} type="booking" />
                            <Badge variant="outline">#{booking.id}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Icon name="Phone" size={14} />
                          <a href={`tel:${booking.customer_phone}`} className="hover:text-foreground">
                            {booking.customer_phone}
                          </a>
                        </div>
                        {booking.customer_email && (
                          <div className="flex items-center gap-2">
                            <Icon name="Mail" size={14} />
                            <a href={`mailto:${booking.customer_email}`} className="hover:text-foreground">
                              {booking.customer_email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Детали</p>
                      <div className="space-y-1 text-sm">
                        {booking.service_type && (
                          <div className="flex items-center gap-2">
                            <Icon name="Wrench" size={14} className="text-muted-foreground" />
                            <span>{booking.service_type}</span>
                          </div>
                        )}
                        {booking.car_brand && booking.car_model && (
                          <div className="flex items-center gap-2">
                            <Icon name="Car" size={14} className="text-muted-foreground" />
                            <span>{booking.car_brand} {booking.car_model}</span>
                          </div>
                        )}
                        {booking.preferred_date && (
                          <div className="flex items-center gap-2">
                            <Icon name="Calendar" size={14} className="text-muted-foreground" />
                            <span>{formatDate(booking.preferred_date)}</span>
                          </div>
                        )}
                        {booking.preferred_time && (
                          <div className="flex items-center gap-2">
                            <Icon name="Clock" size={14} className="text-muted-foreground" />
                            <span>{booking.preferred_time}</span>
                          </div>
                        )}
                      </div>
                      {booking.comment && (
                        <div className="mt-2 text-sm">
                          <p className="text-muted-foreground mb-1">Комментарий:</p>
                          <p className="text-foreground italic">"{booking.comment}"</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Управление</p>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => handleStatusChange(booking.id, value)}
                        disabled={updatingId === booking.id}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Новая</SelectItem>
                          <SelectItem value="confirmed">Подтверждена</SelectItem>
                          <SelectItem value="completed">Завершена</SelectItem>
                          <SelectItem value="cancelled">Отменена</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-4 text-xs text-muted-foreground">
                        <div>Создана: {formatDateTime(booking.created_at)}</div>
                        <div>Обновлена: {formatDateTime(booking.updated_at)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
            )}
          </div>

          <DeleteBookingsDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSuccess={fetchBookings}
            onExport={handleExport}
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPage;