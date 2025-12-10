import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

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
  const navigate = useNavigate();
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

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/0a5a5f24-24e2-4ab9-9cd1-b55adbc62b49');
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

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        title: promotion.title,
        description: promotion.description,
        discount: promotion.discount,
        old_price: promotion.old_price || '',
        new_price: promotion.new_price,
        valid_until: promotion.valid_until,
        icon: promotion.icon,
        details: promotion.details,
        is_active: promotion.is_active
      });
    } else {
      setEditingPromotion(null);
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
        ? 'https://functions.poehali.dev/07f352c0-0a8d-4307-9048-288381aa9f45'
        : 'https://functions.poehali.dev/5a0a3612-f9b3-4eba-8ac1-3230f81d8bc4';

      const body = editingPromotion
        ? { id: editingPromotion.id, ...formData }
        : formData;

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
      const response = await fetch('https://functions.poehali.dev/4a0720cb-4906-457f-8860-4f6196d93031', {
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
      const response = await fetch('https://functions.poehali.dev/07f352c0-0a8d-4307-9048-288381aa9f45', {
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
            <h1 className="text-4xl font-bold mb-2">Управление акциями</h1>
            <p className="text-muted-foreground">Создавайте и редактируйте акции для клиентов</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenDialog()}>
              <Icon name="Plus" className="mr-2" size={18} />
              Добавить акцию
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <Icon name="ArrowLeft" className="mr-2" size={18} />
              Назад
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <Card key={promotion.id} className={!promotion.is_active ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name={promotion.icon as any} size={24} className="text-primary" />
                      <Badge variant={promotion.is_active ? 'default' : 'secondary'}>
                        {promotion.is_active ? 'Активна' : 'Неактивна'}
                      </Badge>
                    </div>
                    <CardTitle className="mb-2">{promotion.title}</CardTitle>
                    <CardDescription>{promotion.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Скидка:</span>
                    <Badge className="gradient-accent">{promotion.discount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Цена:</span>
                    <div className="text-right">
                      {promotion.old_price && (
                        <span className="text-sm line-through text-muted-foreground mr-2">
                          {promotion.old_price}
                        </span>
                      )}
                      <span className="font-bold text-primary">{promotion.new_price}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">До:</span>
                    <span className="text-sm">{promotion.valid_until}</span>
                  </div>
                  <div className="pt-3 border-t flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => toggleActive(promotion)}
                    >
                      <Icon name={promotion.is_active ? 'EyeOff' : 'Eye'} size={16} className="mr-1" />
                      {promotion.is_active ? 'Скрыть' : 'Показать'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(promotion)}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(promotion.id)}
                    >
                      <Icon name="Trash" size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? 'Редактировать акцию' : 'Новая акция'}
              </DialogTitle>
              <DialogDescription>
                Заполните информацию об акции
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Сезонное ТО"
                />
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Комплексная диагностика + замена масла со скидкой 25%"
                />
              </div>

              <div>
                <Label>Подробности</Label>
                <Textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Включает проверку всех систем автомобиля..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Скидка</Label>
                  <Input
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="-25%"
                  />
                </div>

                <div>
                  <Label>Иконка</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            <Icon name={icon as any} size={16} />
                            {icon}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Старая цена (опционально)</Label>
                  <Input
                    value={formData.old_price}
                    onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                    placeholder="6 000 ₽"
                  />
                </div>

                <div>
                  <Label>Новая цена</Label>
                  <Input
                    value={formData.new_price}
                    onChange={(e) => setFormData({ ...formData, new_price: e.target.value })}
                    placeholder="4 500 ₽"
                  />
                </div>
              </div>

              <div>
                <Label>Действительна до</Label>
                <Input
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  placeholder="December 31, 2025 23:59:59 или Постоянно"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  id="is_active"
                />
                <Label htmlFor="is_active">Акция активна</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPromotionsPage;