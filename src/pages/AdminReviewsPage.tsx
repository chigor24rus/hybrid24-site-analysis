import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { 
  AdminLayout, 
  LoadingScreen, 
  AdminPageHeader, 
  ReviewCard, 
  ReviewFormDialog, 
  ImportDialog 
} from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Review } from '@/components/sections/home/ReviewsSection';

const AdminReviewsPage = () => {
  const { logout } = useAdminAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  
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

  const handleEditReview = async () => {
    if (!editingReview) return;

    try {
      const response = await fetch('https://functions.poehali.dev/32d0d28e-e35c-44a4-b9b2-bf9152960524', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingReview.id,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Отзыв успешно обновлен!');
        setIsEditDialogOpen(false);
        setEditingReview(null);
        fetchReviews();
      } else {
        toast.error(data.error || 'Ошибка при обновлении отзыва');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Ошибка при обновлении отзыва');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;

    try {
      const response = await fetch('https://functions.poehali.dev/c627baa8-d31a-4aea-a57f-13d47053d8e8', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: reviewId })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Отзыв успешно удален!');
        fetchReviews();
      } else {
        toast.error(data.error || 'Ошибка при удалении отзыва');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Ошибка при удалении отзыва');
    }
  };

  const openEditDialog = (review: Review) => {
    setEditingReview(review);
    setFormData({
      customer_name: review.customer_name,
      rating: review.rating,
      review_text: review.review_text,
      service_name: review.service_name,
      review_date: review.review_date,
      source: review.source,
      is_visible: review.is_visible
    });
    setIsEditDialogOpen(true);
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
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={openEditDialog}
              onDelete={handleDeleteReview}
            />
          ))}
        </div>
      </div>

      <ReviewFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Добавить новый отзыв"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleAddReview}
        submitLabel="Добавить отзыв"
      />

      <ReviewFormDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingReview(null);
        }}
        title="Редактировать отзыв"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleEditReview}
        submitLabel="Сохранить изменения"
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        importUrl={importUrl}
        onImportUrlChange={setImportUrl}
        onImport={handleImportReviews}
        importing={importing}
      />
    </AdminLayout>
  );
};

export default AdminReviewsPage;
