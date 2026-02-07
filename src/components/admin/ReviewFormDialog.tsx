import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface ReviewFormData {
  customer_name: string;
  rating: number;
  review_text: string;
  service_name: string;
  review_date: string;
  source: string;
  is_visible: boolean;
}

interface ReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: ReviewFormData;
  onFormDataChange: (data: ReviewFormData) => void;
  onSubmit: () => void;
  submitLabel: string;
}

export const ReviewFormDialog = ({
  open,
  onOpenChange,
  title,
  formData,
  onFormDataChange,
  onSubmit,
  submitLabel
}: ReviewFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer_name">Имя клиента *</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => onFormDataChange({ ...formData, customer_name: e.target.value })}
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
                  onClick={() => onFormDataChange({ ...formData, rating: star })}
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
              onChange={(e) => onFormDataChange({ ...formData, review_text: e.target.value })}
              placeholder="Отличный сервис..."
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="service_name">Услуга *</Label>
            <Input
              id="service_name"
              value={formData.service_name}
              onChange={(e) => onFormDataChange({ ...formData, service_name: e.target.value })}
              placeholder="Замена масла"
            />
          </div>

          <div>
            <Label htmlFor="review_date">Дата отзыва</Label>
            <Input
              id="review_date"
              type="date"
              value={formData.review_date}
              onChange={(e) => onFormDataChange({ ...formData, review_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="source">Источник</Label>
            <select
              id="source"
              value={formData.source}
              onChange={(e) => onFormDataChange({ ...formData, source: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, is_visible: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="is_visible">Показывать на сайте</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onSubmit} className="gradient-primary flex-1">
              {submitLabel}
            </Button>
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline"
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
