import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  brand_id: number;
  brand_name: string;
  name: string;
  year_from: number | null;
  year_to: number | null;
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
}

interface Price {
  id: number;
  brand_id: number;
  model_id: number | null;
  service_id: number;
  price: string;
  brand_name?: string;
  model_name?: string;
  service_title?: string;
}

interface BulkForm {
  brand_ids: string[];
  model_ids: string[];
  service_ids: string[];
  operation: string;
  value: string;
}

interface BulkUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bulkForm: BulkForm;
  setBulkForm: (form: BulkForm) => void;
  brands: Brand[];
  models: Model[];
  services: Service[];
  prices: Price[];
  onUpdate: () => Promise<void>;
}

const BulkUpdateDialog = ({ 
  isOpen, 
  onOpenChange, 
  bulkForm, 
  setBulkForm, 
  brands, 
  models, 
  services,
  prices,
  onUpdate 
}: BulkUpdateDialogProps) => {
  const affectedCount = prices.filter(p => {
    const brandMatch = bulkForm.brand_ids.includes(p.brand_id.toString());
    const modelMatch = bulkForm.model_ids.length === 0 || bulkForm.model_ids.includes(p.model_id?.toString() || '');
    const serviceMatch = bulkForm.service_ids.length === 0 || bulkForm.service_ids.includes(p.service_id.toString());
    return brandMatch && modelMatch && serviceMatch;
  }).length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Массовое изменение цен</DialogTitle>
          <DialogDescription>Выберите критерии и укажите изменение для множества цен</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Бренды * (можно выбрать несколько)</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-1 rounded">
                  <input
                    type="checkbox"
                    checked={bulkForm.brand_ids.includes(brand.id.toString())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkForm({ ...bulkForm, brand_ids: [...bulkForm.brand_ids, brand.id.toString()] });
                      } else {
                        setBulkForm({ ...bulkForm, brand_ids: bulkForm.brand_ids.filter(id => id !== brand.id.toString()) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Модели (опционально, все если не выбрано)</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
              {models
                .filter(m => bulkForm.brand_ids.includes(m.brand_id.toString()))
                .map((model) => (
                  <label key={model.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-1 rounded">
                    <input
                      type="checkbox"
                      checked={bulkForm.model_ids.includes(model.id.toString())}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkForm({ ...bulkForm, model_ids: [...bulkForm.model_ids, model.id.toString()] });
                        } else {
                          setBulkForm({ ...bulkForm, model_ids: bulkForm.model_ids.filter(id => id !== model.id.toString()) });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{model.brand_name} - {model.name}</span>
                  </label>
                ))}
              {bulkForm.brand_ids.length > 0 && models.filter(m => bulkForm.brand_ids.includes(m.brand_id.toString())).length === 0 && (
                <p className="text-sm text-muted-foreground">Нет моделей для выбранных брендов</p>
              )}
              {bulkForm.brand_ids.length === 0 && (
                <p className="text-sm text-muted-foreground">Сначала выберите бренды</p>
              )}
            </div>
          </div>

          <div>
            <Label>Услуги (опционально, все если не выбрано)</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
              {services.map((service) => (
                <label key={service.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-1 rounded">
                  <input
                    type="checkbox"
                    checked={bulkForm.service_ids.includes(service.id.toString())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkForm({ ...bulkForm, service_ids: [...bulkForm.service_ids, service.id.toString()] });
                      } else {
                        setBulkForm({ ...bulkForm, service_ids: bulkForm.service_ids.filter(id => id !== service.id.toString()) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{service.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <Label>Тип изменения</Label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm mb-3"
              value={bulkForm.operation}
              onChange={(e) => setBulkForm({ ...bulkForm, operation: e.target.value })}
            >
              <option value="set">Установить цену</option>
              <option value="increase">Увеличить на</option>
              <option value="decrease">Уменьшить на</option>
              <option value="multiply">Умножить на</option>
            </select>

            <Label>
              {bulkForm.operation === 'set' && 'Новая цена'}
              {bulkForm.operation === 'increase' && 'Сумма увеличения'}
              {bulkForm.operation === 'decrease' && 'Сумма уменьшения'}
              {bulkForm.operation === 'multiply' && 'Коэффициент (например, 1.1 = +10%)'}
            </Label>
            <Input
              value={bulkForm.value}
              onChange={(e) => setBulkForm({ ...bulkForm, value: e.target.value })}
              placeholder={bulkForm.operation === 'multiply' ? '1.1' : '1000 ₽'}
            />
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Будет изменено цен:</p>
            <p className="text-muted-foreground">{affectedCount} шт.</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={onUpdate} className="flex-1">
              Применить изменения
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

export default BulkUpdateDialog;
