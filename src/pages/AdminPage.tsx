import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import DeleteBookingsDialog from '@/components/DeleteBookingsDialog';

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

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  completed: 'Завершена',
  cancelled: 'Отменена',
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    const authTime = localStorage.getItem('adminAuthTime');
    
    if (!isAuthenticated || !authTime) {
      navigate('/admin/login');
      return;
    }
    
    const hoursSinceAuth = (Date.now() - parseInt(authTime)) / (1000 * 60 * 60);
    if (hoursSinceAuth > 24) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminAuthTime');
      navigate('/admin/login');
    }
  }, [navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'all'
        ? 'https://functions.poehali.dev/07871607-696c-49db-b330-8d0d08b2896e'
        : `https://functions.poehali.dev/07871607-696c-49db-b330-8d0d08b2896e?status=${filterStatus}`;
      
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
      const response = await fetch('https://functions.poehali.dev/04351be8-3746-49dd-9c00-c57ea8ad97f3', {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch {
      return dateString;
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

      const response = await fetch('https://functions.poehali.dev/aec56852-2ec9-4a3d-88bb-f6a21b412e84', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Админ-панель</h1>
            <p className="text-muted-foreground">Управление заявками клиентов</p>
          </div>
          <div className="flex gap-2">
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
            <Button variant="outline" onClick={() => navigate('/admin/data')}>
              <Icon name="Database" className="mr-2" size={18} />
              Бренды и цены
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/models')}>
              <Icon name="Car" className="mr-2" size={18} />
              Модели
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/reviews')}>
              <Icon name="MessageSquare" className="mr-2" size={18} />
              Отзывы
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/blog')}>
              <Icon name="FileText" className="mr-2" size={18} />
              Блог
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/promotions')}>
              <Icon name="Percent" className="mr-2" size={18} />
              Акции
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/logs')}>
              <Icon name="Bug" className="mr-2" size={18} />
              Логи ошибок
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/settings')}>
              <Icon name="Settings" className="mr-2" size={18} />
              Настройки
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem('adminAuth');
                localStorage.removeItem('adminAuthTime');
                navigate('/admin/login');
              }}
            >
              <Icon name="LogOut" className="mr-2" size={18} />
              Выйти
            </Button>
          </div>
        </div>

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
                {filterStatus === 'all' ? 'Пока не поступило ни одной заявки' : `Нет заявок со статусом "${statusLabels[filterStatus]}"`}
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
                            <Badge className={statusColors[booking.status] || 'bg-gray-100 text-gray-800'}>
                              {statusLabels[booking.status] || booking.status}
                            </Badge>
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
  );
};

export default AdminPage;
