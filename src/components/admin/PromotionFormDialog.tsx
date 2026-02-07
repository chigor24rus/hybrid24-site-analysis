import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface PromotionFormData {
  title: string;
  description: string;
  discount: string;
  old_price: string;
  new_price: string;
  valid_until: string;
  icon: string;
  details: string;
  is_active: boolean;
}

interface PromotionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: PromotionFormData;
  onFormDataChange: (data: PromotionFormData) => void;
  isPermanent: boolean;
  onIsPermanentChange: (value: boolean) => void;
  onSave: () => void;
  saving: boolean;
  iconOptions: string[];
}

export const PromotionFormDialog = ({
  open,
  onOpenChange,
  isEditing,
  formData,
  onFormDataChange,
  isPermanent,
  onIsPermanentChange,
  onSave,
  saving,
  iconOptions
}: PromotionFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редактировать акцию' : 'Новая акция'}
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
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              placeholder="Сезонное ТО"
            />
          </div>

          <div>
            <Label>Описание</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Комплексная диагностика + замена масла со скидкой 25%"
            />
          </div>

          <div>
            <Label>Подробности</Label>
            <Textarea
              value={formData.details}
              onChange={(e) => onFormDataChange({ ...formData, details: e.target.value })}
              placeholder="Включает проверку всех систем автомобиля..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Скидка</Label>
              <Input
                value={formData.discount}
                onChange={(e) => onFormDataChange({ ...formData, discount: e.target.value })}
                placeholder="-25%"
              />
            </div>

            <div>
              <Label>Иконка</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => onFormDataChange({ ...formData, icon: value })}
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
                onChange={(e) => onFormDataChange({ ...formData, old_price: e.target.value })}
                placeholder="6 000 ₽"
              />
            </div>

            <div>
              <Label>Новая цена</Label>
              <Input
                value={formData.new_price}
                onChange={(e) => onFormDataChange({ ...formData, new_price: e.target.value })}
                placeholder="4 500 ₽"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Действительна до</Label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={isPermanent}
                onChange={(e) => onIsPermanentChange(e.target.checked)}
                id="is_permanent"
              />
              <Label htmlFor="is_permanent" className="cursor-pointer">Постоянная акция</Label>
            </div>
            {!isPermanent && (
              <Input
                type="datetime-local"
                value={formData.valid_until}
                onChange={(e) => onFormDataChange({ ...formData, valid_until: e.target.value })}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.checked })}
              id="is_active"
            />
            <Label htmlFor="is_active">Акция активна</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onSave} disabled={saving} className="flex-1">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
