import { useState } from 'react';
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

interface PriceForm {
  id: number;
  brand_id: string;
  model_id: string;
  service_id: string;
  price: string;
}

interface PriceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  priceForm: PriceForm;
  setPriceForm: (form: PriceForm) => void;
  brands: Brand[];
  models: Model[];
  services: Service[];
  onSave: () => Promise<void>;
}

const PriceDialog = ({ 
  isOpen, 
  onOpenChange, 
  priceForm, 
  setPriceForm, 
  brands, 
  models, 
  services,
  onSave 
}: PriceDialogProps) => {
  const [searchBrand, setSearchBrand] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [searchService, setSearchService] = useState('');

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSearchBrand('');
      setSearchModel('');
      setSearchService('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{priceForm.id ? 'Редактировать цену' : 'Добавить цену'}</DialogTitle>
          <DialogDescription>Укажите бренд, модель (опционально), услугу и цену</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Бренд *</Label>
            <Input
              placeholder="Поиск бренда..."
              value={searchBrand}
              onChange={(e) => setSearchBrand(e.target.value)}
              className="mb-2"
            />
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={priceForm.brand_id} 
              onChange={(e) => {
                setPriceForm({ ...priceForm, brand_id: e.target.value, model_id: '' });
                setSearchBrand('');
              }}
              size={Math.min(brands.filter(b => b.name.toLowerCase().includes(searchBrand.toLowerCase())).length + 1, 8)}
            >
              <option value="">Выберите бренд</option>
              {brands
                .filter(brand => brand.name.toLowerCase().includes(searchBrand.toLowerCase()))
                .map((brand) => (
                  <option key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label>Модель (опционально)</Label>
            <Input
              placeholder="Поиск модели..."
              value={searchModel}
              onChange={(e) => setSearchModel(e.target.value)}
              className="mb-2"
              disabled={!priceForm.brand_id}
            />
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={priceForm.model_id} 
              onChange={(e) => {
                setPriceForm({ ...priceForm, model_id: e.target.value });
                setSearchModel('');
              }}
              disabled={!priceForm.brand_id}
              size={priceForm.brand_id ? Math.min(models.filter(m => m.brand_id.toString() === priceForm.brand_id && m.name.toLowerCase().includes(searchModel.toLowerCase())).length + 1, 8) : 2}
            >
              <option value="">Все модели</option>
              {models
                .filter(m => m.brand_id.toString() === priceForm.brand_id && m.name.toLowerCase().includes(searchModel.toLowerCase()))
                .map((model) => (
                  <option key={model.id} value={model.id.toString()}>
                    {model.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label>Услуга *</Label>
            <Input
              placeholder="Поиск услуги..."
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
              className="mb-2"
            />
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={priceForm.service_id} 
              onChange={(e) => {
                setPriceForm({ ...priceForm, service_id: e.target.value });
                setSearchService('');
              }}
              size={Math.min(services.filter(s => s.title.toLowerCase().includes(searchService.toLowerCase())).length + 1, 8)}
            >
              <option value="">Выберите услугу</option>
              {services
                .filter(service => service.title.toLowerCase().includes(searchService.toLowerCase()))
                .map((service) => (
                  <option key={service.id} value={service.id.toString()}>
                    {service.title}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label>Цена *</Label>
            <Input
              value={priceForm.price}
              onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
              placeholder="5 000 ₽"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} className="flex-1">
              Сохранить
            </Button>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceDialog;
