import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Review } from '@/components/sections/home/ReviewsSection';

const AdminReviewsPage = () => {
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
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
    const adminPassword = localStorage.getItem('adminPassword');
    if (!adminPassword) {
      navigate('/admin');
      return;
    }
    fetchReviews();
  }, [navigate]);

  const fetchReviews = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc');
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
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
    return (
      <div className="min-h-screen">
        <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header isBookingOpen={isBookingOpen} setIsBookingOpen={setIsBookingOpen} />
      
      <section className="py-12 md:py-16 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Управление отзывами</h1>
              <p className="text-muted-foreground">Всего отзывов: {reviews.length}</p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="gradient-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить отзыв
            </Button>
          </div>

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
                        <EyeOff className="h-3 w-3" />
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
      </section>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Добавить новый отзыв</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      <Star className={`h-4 w-4 ${formData.rating >= star ? 'fill-current' : ''}`} />
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
            </CardContent>
          </Card>
        </div>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminReviewsPage;
