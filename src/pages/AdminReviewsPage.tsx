import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { AdminLayout, LoadingScreen, AdminPageHeader } from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Review } from '@/components/sections/home/ReviewsSection';

const AdminReviewsPage = () => {
  const { logout } = useAdminAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    rating: 5,
    review_text: '',
    service_name: '',
    review_date: new Date().toISOString().split('T')[0],
    source: 'yandex',
    is_visible: true
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/fe3a5b5b-90b1-406c-82f5-e74bbf2ebdd9');
      const data = await response.json();
      if (response.ok && data.reviews) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Ошибка загрузки отзывов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/0916c610-058d-41be-ba74-88b82dac175e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Отзыв успешно добавлен!');
        setIsAddDialogOpen(false);
        fetchReviews();
        setFormData({
          customer_name: '',
          rating: 5,
          review_text: '',
          service_name: '',
          review_date: new Date().toISOString().split('T')[0],
          source: 'yandex',
          is_visible: true
        });
      } else {
        toast.error(data.error || 'Ошибка при добавлении отзыва');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Ошибка при добавлении отзыва');
    }
  };

  const handleImportReviews = async () => {
    if (!importUrl.trim()) {
      toast.error('Введите URL организации на Яндекс.Картах');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch('https://functions.poehali.dev/e046b52b-bb1a-44dd-a9e3-989af297c485', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ organization_url: importUrl })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Импортировано ${data.imported} отзывов, пропущено ${data.skipped}`);
        setIsImportDialogOpen(false);
        setImportUrl('');
        fetchReviews();
      } else {
        toast.error(data.error || data.note || 'Ошибка при импорте отзывов');
      }
    } catch (error) {
      console.error('Error importing reviews:', error);
      toast.error('Ошибка при импорте отзывов');
    } finally {
      setImporting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <Icon
            key={index}
            name="Star"
            size={16}
            className={`${
              index < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <AdminPageHeader
          title="Управление отзывами"
          description={`Всего отзывов: ${reviews.length}`}
          actions={
            <>
              <Button 
                onClick={() => setIsImportDialogOpen(true)}
                variant="outline"
              >
                <Icon name="Download" className="mr-2" size={18} />
                Импорт из Яндекс.Карт
              </Button>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="gradient-primary"
              >
                <Icon name="Plus" className="mr-2" size={18} />
                Добавить отзыв
              </Button>
              <Button variant="outline" onClick={logout}>
                <Icon name="LogOut" className="mr-2" size={18} />
                Выйти
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className={!review.is_visible ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{review.customer_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{review.review_date}</p>
                  </div>
                  {renderStars(review.rating)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Badge variant="secondary">{review.service_name}</Badge>
                  <Badge variant="outline">{review.source}</Badge>
                  {!review.is_visible && (
                    <Badge variant="destructive">
                      <Icon name="EyeOff" size={12} />
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {review.review_text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить новый отзыв</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer_name">Имя клиента *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Иван Иванов"
              />
            </div>

            <div>
              <Label htmlFor="rating">Рейтинг *</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant={formData.rating >= star ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, rating: star })}
                  >
                    <Icon 
                      name="Star" 
                      size={16}
                      className={formData.rating >= star ? 'fill-current' : ''}
                    />
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="review_text">Текст отзыва *</Label>
              <Textarea
                id="review_text"
                value={formData.review_text}
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                placeholder="Отличный сервис..."
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="service_name">Услуга *</Label>
              <Input
                id="service_name"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                placeholder="Замена масла"
              />
            </div>

            <div>
              <Label htmlFor="review_date">Дата отзыва</Label>
              <Input
                id="review_date"
                type="date"
                value={formData.review_date}
                onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="source">Источник</Label>
              <select
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="yandex">Яндекс.Карты</option>
                <option value="2gis">2GIS</option>
                <option value="google">Google Maps</option>
                <option value="manual">Вручную</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_visible"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_visible">Показывать на сайте</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddReview} className="gradient-primary flex-1">
                Добавить отзыв
              </Button>
              <Button 
                onClick={() => setIsAddDialogOpen(false)} 
                variant="outline"
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Импорт отзывов из Яндекс.Карт</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import_url">URL организации на Яндекс.Картах</Label>
              <Input
                id="import_url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://yandex.ru/maps/org/..."
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Откройте вашу организацию на Яндекс.Картах и скопируйте URL из адресной строки
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Обратите внимание:</strong> Автоматический импорт может работать не всегда из-за ограничений API Яндекс.Карт. 
                Если импорт не удался, используйте ручное добавление отзывов через форму.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleImportReviews} 
                className="gradient-primary flex-1"
                disabled={importing}
              >
                {importing ? (
                  <>
                    <Icon name="Download" className="mr-2 animate-pulse" size={16} />
                    Импортируем...
                  </>
                ) : (
                  <>
                    <Icon name="Download" className="mr-2" size={16} />
                    Импортировать
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setIsImportDialogOpen(false)} 
                variant="outline"
                className="flex-1"
                disabled={importing}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReviewsPage;