import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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

interface Price {
  id: number;
  brand_id: number;
  model_id: number | null;
  service_id: number;
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
  prices: Price[];
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
  prices,
  onSave 
}: PriceDialogProps) => {
  const [searchBrand, setSearchBrand] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [searchService, setSearchService] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [onlyNoPrices, setOnlyNoPrices] = useState(false);

  const priceSet = new Set(
    prices.map(p => `${p.brand_id}-${p.model_id || 'null'}-${p.service_id}`)
  );

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSearchBrand('');
      setSearchModel('');
      setSearchService('');
      setShowBrandDropdown(false);
      setShowModelDropdown(false);
      setShowServiceDropdown(false);
      setOnlyNoPrices(false);
    }
  };

  const hasPrice = (brandId: string, modelId: string, serviceId: string) => {
    const key = `${brandId}-${modelId || 'null'}-${serviceId}`;
    return priceSet.has(key);
  };

  const filteredBrands = brands.filter(brand => {
    if (!onlyNoPrices) return brand.name.toLowerCase().includes(searchBrand.toLowerCase());
    const matchesSearch = brand.name.toLowerCase().includes(searchBrand.toLowerCase());
    const hasNoPriceForAnyService = services.some(service => 
      !hasPrice(brand.id.toString(), '', service.id.toString())
    );
    return matchesSearch && hasNoPriceForAnyService;
  });

  const filteredModels = models.filter(m => {
    if (m.brand_id.toString() !== priceForm.brand_id) return false;
    if (!onlyNoPrices) return m.name.toLowerCase().includes(searchModel.toLowerCase());
    const matchesSearch = m.name.toLowerCase().includes(searchModel.toLowerCase());
    const serviceId = priceForm.service_id || services[0]?.id.toString() || '';
    const hasNoPriceForService = serviceId && !hasPrice(priceForm.brand_id, m.id.toString(), serviceId);
    return matchesSearch && hasNoPriceForService;
  });

  const filteredServices = services.filter(service => {
    if (!onlyNoPrices) return service.title.toLowerCase().includes(searchService.toLowerCase());
    const matchesSearch = service.title.toLowerCase().includes(searchService.toLowerCase());
    const hasNoPriceForCurrent = !hasPrice(
      priceForm.brand_id || brands[0]?.id.toString() || '',
      priceForm.model_id,
      service.id.toString()
    );
    return matchesSearch && hasNoPriceForCurrent;
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{priceForm.id ? 'Редактировать цену' : 'Добавить цену'}</DialogTitle>
          <DialogDescription>Укажите бренд, модель (опционально), услугу и цену</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="only-no-prices" 
              checked={onlyNoPrices}
              onCheckedChange={(checked) => setOnlyNoPrices(checked as boolean)}
            />
            <Label htmlFor="only-no-prices" className="cursor-pointer">
              Только без цен
            </Label>
          </div>
          <div className="relative">
            <Label>Бренд *</Label>
            <Input
              placeholder="Поиск бренда..."
              value={searchBrand || (priceForm.brand_id ? brands.find(b => b.id.toString() === priceForm.brand_id)?.name : '')}
              onChange={(e) => {
                setSearchBrand(e.target.value);
                setShowBrandDropdown(true);
              }}
              onFocus={() => setShowBrandDropdown(true)}
            />
            {showBrandDropdown && (
              <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => (
                    <div
                      key={brand.id}
                      className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setPriceForm({ ...priceForm, brand_id: brand.id.toString(), model_id: '' });
                        setSearchBrand('');
                        setShowBrandDropdown(false);
                      }}
                    >
                      {brand.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Ничего не найдено</div>
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <Label>Модель (опционально)</Label>
            <Input
              placeholder="Все модели"
              value={searchModel || (priceForm.model_id ? models.find(m => m.id.toString() === priceForm.model_id)?.name : '')}
              onChange={(e) => {
                setSearchModel(e.target.value);
                setShowModelDropdown(true);
              }}
              onFocus={() => setShowModelDropdown(true)}
              disabled={!priceForm.brand_id}
            />
            {showModelDropdown && priceForm.brand_id && (
              <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
                <div
                  className="px-3 py-2 text-sm hover:bg-accent cursor-pointer font-medium"
                  onClick={() => {
                    setPriceForm({ ...priceForm, model_id: '' });
                    setSearchModel('');
                    setShowModelDropdown(false);
                  }}
                >
                  Все модели
                </div>
                {filteredModels.length > 0 ? (
                  filteredModels.map((model) => (
                    <div
                      key={model.id}
                      className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setPriceForm({ ...priceForm, model_id: model.id.toString() });
                        setSearchModel('');
                        setShowModelDropdown(false);
                      }}
                    >
                      {model.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Ничего не найдено</div>
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <Label>Услуга *</Label>
            <Input
              placeholder="Поиск услуги..."
              value={searchService || (priceForm.service_id ? services.find(s => s.id.toString() === priceForm.service_id)?.title : '')}
              onChange={(e) => {
                setSearchService(e.target.value);
                setShowServiceDropdown(true);
              }}
              onFocus={() => setShowServiceDropdown(true)}
            />
            {showServiceDropdown && (
              <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setPriceForm({ ...priceForm, service_id: service.id.toString() });
                        setSearchService('');
                        setShowServiceDropdown(false);
                      }}
                    >
                      {service.title}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Ничего не найдено</div>
                )}
              </div>
            )}
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