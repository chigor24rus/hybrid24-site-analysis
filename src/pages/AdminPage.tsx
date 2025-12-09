import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

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

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    const authTime = localStorage.getItem('adminAuthTime');
    
    if (!isAuthenticated || !authTime) {
      navigate('/admin/login');
      return;
    }
    
    // Check if session is older than 24 hours
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
        // Update local state
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
            <Button variant="outline" onClick={() => navigate('/admin/data')}>
              <Icon name="Database" className="mr-2" size={18} />
              Бренды и цены
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/reviews')}>
              <Icon name="MessageSquare" className="mr-2" size={18} />
              Отзывы
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/blog')}>
              <Icon name="FileText" className="mr-2" size={18} />
              Блог
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

        {/* Statistics */}
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

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="Inbox" className="mx-auto mb-4 text-muted-foreground" size={48} />
                <p className="text-muted-foreground">Заявок пока нет</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {booking.customer_name}
                        </CardTitle>
                        <Badge className={statusColors[booking.status]}>
                          {statusLabels[booking.status]}
                        </Badge>
                      </div>
                      <CardDescription>
                        Заявка #{booking.id} • Создана {formatDateTime(booking.created_at)}
                      </CardDescription>
                    </div>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => handleStatusChange(booking.id, value)}
                      disabled={updatingId === booking.id}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Новая</SelectItem>
                        <SelectItem value="confirmed">Подтверждена</SelectItem>
                        <SelectItem value="completed">Завершена</SelectItem>
                        <SelectItem value="cancelled">Отменена</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Icon name="Phone" size={16} className="mt-1 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Телефон</div>
                          <div className="font-medium">
                            <a href={`tel:${booking.customer_phone}`} className="hover:text-primary">
                              {booking.customer_phone}
                            </a>
                          </div>
                        </div>
                      </div>
                      {booking.customer_email && (
                        <div className="flex items-start gap-2">
                          <Icon name="Mail" size={16} className="mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Email</div>
                            <div className="font-medium">
                              <a href={`mailto:${booking.customer_email}`} className="hover:text-primary">
                                {booking.customer_email}
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                      {booking.service_type && (
                        <div className="flex items-start gap-2">
                          <Icon name="Wrench" size={16} className="mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Услуга</div>
                            <div className="font-medium">{booking.service_type}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {(booking.car_brand || booking.car_model) && (
                        <div className="flex items-start gap-2">
                          <Icon name="Car" size={16} className="mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Автомобиль</div>
                            <div className="font-medium">
                              {booking.car_brand} {booking.car_model}
                            </div>
                          </div>
                        </div>
                      )}
                      {booking.preferred_date && (
                        <div className="flex items-start gap-2">
                          <Icon name="Calendar" size={16} className="mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Дата визита</div>
                            <div className="font-medium">
                              {formatDate(booking.preferred_date)}
                              {booking.preferred_time && ` в ${booking.preferred_time}`}
                            </div>
                          </div>
                        </div>
                      )}
                      {booking.comment && (
                        <div className="flex items-start gap-2">
                          <Icon name="MessageSquare" size={16} className="mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Комментарий</div>
                            <div className="font-medium">{booking.comment}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;