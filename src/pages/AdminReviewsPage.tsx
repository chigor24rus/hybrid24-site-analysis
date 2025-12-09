import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  service: string;
  date: string;
  is_visible: boolean;
  source?: string;
}

const AdminReviewsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    rating: 5,
    review_text: '',
    service_name: '',
    review_date: new Date().toISOString().split('T')[0]
  });

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
      return;
    }

    fetchReviews();
  }, [navigate]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/24530517-9b0c-4a6b-957e-ac05025d52ce?show_all=true');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить отзывы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingReview) {
        const response = await fetch('https://functions.poehali.dev/24530517-9b0c-4a6b-957e-ac05025d52ce', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            review_id: editingReview.id,
            ...formData
          })
        });

        if (response.ok) {
          toast({
            title: "Успешно",
            description: "Отзыв обновлён",
          });
        }
      } else {
        const response = await fetch('https://functions.poehali.dev/24530517-9b0c-4a6b-957e-ac05025d52ce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          toast({
            title: "Успешно",
            description: "Отзыв добавлен",
          });
        }
      }

      setDialogOpen(false);
      setEditingReview(null);
      setFormData({
        customer_name: '',
        rating: 5,
        review_text: '',
        service_name: '',
        review_date: new Date().toISOString().split('T')[0]
      });
      fetchReviews();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить отзыв",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/24530517-9b0c-4a6b-957e-ac05025d52ce?review_id=${reviewId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Отзыв удалён",
        });
        fetchReviews();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить отзыв",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      customer_name: review.name,
      rating: review.rating,
      review_text: review.text,
      service_name: review.service === 'Общий отзыв' ? '' : review.service,
      review_date: review.date
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingReview(null);
    setFormData({
      customer_name: '',
      rating: 5,
      review_text: '',
      service_name: '',
      review_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSyncDgis = async () => {
    setSyncing(true);
    try {
      const response = await fetch('https://functions.poehali.dev/25254b30-6bfe-4a37-aa27-58095863d1df', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const message = [
          `Добавлено: ${data.added}`,
          `Обновлено: ${data.updated}`,
          `Опубликовано: ${data.visible}`,
          data.hidden > 0 ? `Скрыто (рейтинг < 4): ${data.hidden}` : null
        ].filter(Boolean).join(' • ');
        
        toast({
          title: "Синхронизация завершена",
          description: message,
        });
        fetchReviews();
      } else {
        toast({
          title: "Ошибка",
          description: data.error || data.message || 'Не удалось синхронизировать отзывы',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось синхронизировать отзывы с 2ГИС",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleVisibility = async (reviewId: number, currentVisibility: boolean) => {
    try {
      const response = await fetch('https://functions.poehali.dev/24530517-9b0c-4a6b-957e-ac05025d52ce', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: reviewId,
          is_visible: !currentVisibility
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: !currentVisibility ? "Отзыв опубликован" : "Отзыв скрыт",
        });
        fetchReviews();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить видимость отзыва",
        variant: "destructive",
      });
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filterStatus === 'visible') return review.is_visible;
    if (filterStatus === 'hidden') return !review.is_visible;
    return true;
  });

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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Управление отзывами</h1>
              <p className="text-muted-foreground">Модерируйте и публикуйте отзывы клиентов</p>
            </div>
            <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSyncDgis}
              disabled={syncing}
            >
              {syncing ? (
                <Icon name="Loader" className="mr-2 animate-spin" size={18} />
              ) : (
                <Icon name="RefreshCw" className="mr-2" size={18} />
              )}
              Синхронизация с 2ГИС
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleDialogClose()}>
                  <Icon name="Plus" className="mr-2" size={18} />
                  Добавить отзыв
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingReview ? 'Редактировать отзыв' : 'Новый отзыв'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer_name">Имя клиента</Label>
                      <Input
                        id="customer_name"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rating">Оценка (1-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review_text">Текст отзыва</Label>
                    <Textarea
                      id="review_text"
                      value={formData.review_text}
                      onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service_name">Услуга (необязательно)</Label>
                      <Input
                        id="service_name"
                        value={formData.service_name}
                        onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review_date">Дата отзыва</Label>
                      <Input
                        id="review_date"
                        type="date"
                        value={formData.review_date}
                        onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Отмена
                    </Button>
                    <Button type="submit">
                      {editingReview ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <Icon name="ArrowLeft" className="mr-2" size={18} />
              Назад
            </Button>
          </div>
          </div>
          <div className="flex gap-2 mb-4">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
            >
              Все ({reviews.length})
            </Button>
            <Button
              variant={filterStatus === 'visible' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('visible')}
            >
              <Icon name="Eye" className="mr-2" size={18} />
              Видимые ({reviews.filter(r => r.is_visible).length})
            </Button>
            <Button
              variant={filterStatus === 'hidden' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('hidden')}
            >
              <Icon name="EyeOff" className="mr-2" size={18} />
              Скрытые ({reviews.filter(r => !r.is_visible).length})
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="MessageSquare" className="mx-auto mb-4 text-muted-foreground" size={48} />
                <p className="text-muted-foreground">Отзывов пока нет. Добавьте первый!</p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id} className={!review.is_visible ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{review.name}</CardTitle>
                        {review.source === '2gis' && (
                          <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full">
                            2ГИС
                          </span>
                        )}
                        {!review.is_visible && (
                          <span className="text-xs px-2 py-1 bg-orange-500/10 text-orange-600 rounded-full">
                            Скрыт
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Icon key={i} name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVisibility(review.id, review.is_visible)}
                        title={review.is_visible ? 'Скрыть отзыв' : 'Показать отзыв'}
                      >
                        <Icon name={review.is_visible ? "EyeOff" : "Eye"} size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(review)}>
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(review.id)}>
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{review.text}</p>
                  <div className="text-sm text-muted-foreground">
                    <Icon name="Wrench" size={14} className="inline mr-1" />
                    {review.service}
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

export default AdminReviewsPage;