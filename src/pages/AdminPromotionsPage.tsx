import { useState, useEffect } from 'react';
import { 
  AdminLayout, 
  LoadingScreen, 
  AdminPageHeader,
  AdminStatsGrid,
  AdminStat,
  PromotionCard, 
  PromotionFormDialog,
  AdminActionButton
} from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { API_ENDPOINTS } from '@/utils/apiClient';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  old_price: string;
  new_price: string;
  valid_until: string;
  icon: string;
  details: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const iconOptions = [
  'Percent', 'Gift', 'Sparkles', 'Search', 'Disc', 'Wind', 
  'Wrench', 'Car', 'Zap', 'Star', 'Tag', 'TrendingDown'
];

const AdminPromotionsPage = () => {
  const { logout } = useAdminAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    old_price: '',
    new_price: '',
    valid_until: '',
    icon: 'Percent',
    details: '',
    is_active: true
  });
  
  const [isPermanent, setIsPermanent] = useState(false);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.promotions.listAdmin);
      const data = await response.json();
      setPromotions(data.promotions || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const convertToDatetimeLocal = (dateString: string) => {
    if (dateString === 'Постоянно') return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      const permanent = promotion.valid_until === 'Постоянно';
      setIsPermanent(permanent);
      setFormData({
        title: promotion.title,
        description: promotion.description,
        discount: promotion.discount,
        old_price: promotion.old_price || '',
        new_price: promotion.new_price,
        valid_until: permanent ? '' : convertToDatetimeLocal(promotion.valid_until),
        icon: promotion.icon,
        details: promotion.details,
        is_active: promotion.is_active
      });
    } else {
      setEditingPromotion(null);
      setIsPermanent(false);
      setFormData({
        title: '',
        description: '',
        discount: '',
        old_price: '',
        new_price: '',
        valid_until: '',
        icon: 'Percent',
        details: '',
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingPromotion
        ? API_ENDPOINTS.promotions.update
        : API_ENDPOINTS.promotions.create;

      let validUntil = formData.valid_until;
      if (isPermanent) {
        validUntil = 'Постоянно';
      } else if (validUntil) {
        const date = new Date(validUntil);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        validUntil = `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
      }

      const body = editingPromotion
        ? { id: editingPromotion.id, ...formData, valid_until: validUntil }
        : { ...formData, valid_until: validUntil };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchPromotions();
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту акцию?')) return;

    try {
      const response = await fetch(API_ENDPOINTS.promotions.delete, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        fetchPromotions();
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const toggleActive = async (promotion: Promotion) => {
    try {
      const response = await fetch(API_ENDPOINTS.promotions.update, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: promotion.id,
          ...promotion,
          is_active: !promotion.is_active
        })
      });

      if (response.ok) {
        fetchPromotions();
      }
    } catch (error) {
      console.error('Error toggling promotion:', error);
    }
  };

  if (loading) return <LoadingScreen />;

  const activePromotions = promotions.filter(p => p.is_active);
  const inactivePromotions = promotions.filter(p => !p.is_active);
  const permanentPromotions = promotions.filter(p => p.valid_until === 'Постоянно');

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <AdminPageHeader
            title="Управление акциями"
            description="Создавайте и редактируйте акции для клиентов"
            showBackButton
            actions={
              <>
                <AdminActionButton
                  icon="Plus"
                  label="Добавить акцию"
                  onClick={() => handleOpenDialog()}
                />
                <AdminActionButton
                  icon="LogOut"
                  label="Выйти"
                  onClick={logout}
                  variant="outline"
                />
              </>
            }
          />

          <AdminStatsGrid cols={4}>
            <AdminStat
              label="Всего акций"
              value={promotions.length}
              icon="Tag"
              color="primary"
            />
            <AdminStat
              label="Активные"
              value={activePromotions.length}
              icon="CheckCircle"
              color="success"
            />
            <AdminStat
              label="Неактивные"
              value={inactivePromotions.length}
              icon="XCircle"
              color="muted"
            />
            <AdminStat
              label="Постоянные"
              value={permanentPromotions.length}
              icon="Infinity"
              color="warning"
            />
          </AdminStatsGrid>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              onToggleActive={toggleActive}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <PromotionFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          isEditing={!!editingPromotion}
          formData={formData}
          onFormDataChange={setFormData}
          isPermanent={isPermanent}
          onIsPermanentChange={setIsPermanent}
          onSave={handleSave}
          saving={saving}
          iconOptions={iconOptions}
        />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPromotionsPage;