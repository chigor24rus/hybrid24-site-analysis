import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [searchService, setSearchService] = useState('');
  const [onlyNoPrices, setOnlyNoPrices] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicePrices, setServicePrices] = useState<Record<string, string>>({});
  const [bulkMode, setBulkMode] = useState(false);

  const priceSet = new Set(
    prices.map(p => `${p.brand_id}-${p.model_id || 'null'}-${p.service_id}`)
  );

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSearchBrand('');
      setSearchService('');
      setOnlyNoPrices(false);
      setSelectedBrands([]);
      setSelectedServices([]);
      setServicePrices({});
      setBulkMode(false);
    }
  };

  const hasPrice = (brandId: string, modelId: string, serviceId: string) => {
    const key = `${brandId}-${modelId || 'null'}-${serviceId}`;
    return priceSet.has(key);
  };

  const filteredBrands = brands.filter(brand => {
    if (!onlyNoPrices) return brand.name.toLowerCase().includes(searchBrand.toLowerCase());
    const matchesSearch = brand.name.toLowerCase().includes(searchBrand.toLowerCase());
    
    // If no services selected yet, check against all services
    const servicesToCheck = selectedServices.length > 0 
      ? services.filter(s => selectedServices.includes(s.id.toString()))
      : services;
    
    const hasNoPriceForSelectedServices = servicesToCheck.some(service => 
      !hasPrice(brand.id.toString(), '', service.id.toString())
    );
    return matchesSearch && hasNoPriceForSelectedServices;
  });

  const filteredServices = services.filter(service => {
    if (!onlyNoPrices) return service.title.toLowerCase().includes(searchService.toLowerCase());
    const matchesSearch = service.title.toLowerCase().includes(searchService.toLowerCase());
    
    // If no brands selected yet, check against all brands
    const brandsToCheck = selectedBrands.length > 0
      ? brands.filter(b => selectedBrands.includes(b.id.toString()))
      : brands;
    
    const hasNoPriceForSelectedBrands = brandsToCheck.some(brand =>
      !hasPrice(brand.id.toString(), '', service.id.toString())
    );
    return matchesSearch && hasNoPriceForSelectedBrands;
  });

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newServices = prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      
      // Remove price if service is deselected
      if (prev.includes(serviceId)) {
        const newPrices = { ...servicePrices };
        delete newPrices[serviceId];
        setServicePrices(newPrices);
      }
      
      return newServices;
    });
  };

  const updateServicePrice = (serviceId: string, price: string) => {
    setServicePrices(prev => ({
      ...prev,
      [serviceId]: price
    }));
  };

  const handleBulkSave = async () => {
    if (selectedBrands.length === 0 || selectedServices.length === 0) {
      alert('Выберите хотя бы один бренд и одну услугу');
      return;
    }

    // Check if all selected services have prices
    const missingPrices = selectedServices.filter(serviceId => !servicePrices[serviceId]?.trim());
    if (missingPrices.length > 0) {
      alert('Укажите цены для всех выбранных услуг');
      return;
    }

    try {
      const combinations = [];
      
      // Generate all combinations and skip existing ones
      for (const brandId of selectedBrands) {
        for (const serviceId of selectedServices) {
          const key = `${brandId}-null-${serviceId}`;
          if (!priceSet.has(key)) {
            combinations.push({ brandId, serviceId });
          }
        }
      }

      if (combinations.length === 0) {
        alert('Все выбранные комбинации уже имеют цены');
        return;
      }

      const totalCombinations = combinations.length;
      const skippedCount = (selectedBrands.length * selectedServices.length) - totalCombinations;
      
      if (skippedCount > 0) {
        const confirmed = confirm(
          `Будет создано ${totalCombinations} цен.\n` +
          `${skippedCount} комбинаций пропущено (цены уже существуют).\n\n` +
          `Продолжить?`
        );
        if (!confirmed) return;
      }

      // Process in batches of 10 to avoid overloading the server
      const batchSize = 10;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < combinations.length; i += batchSize) {
        const batch = combinations.slice(i, i + batchSize);
        
        const batchPromises = batch.map(({ brandId, serviceId }) => {
          const priceValue = servicePrices[serviceId];
          const numericPrice = parseFloat(priceValue.replace(/[^\d.]/g, ''));
          
          return fetch('https://functions.poehali.dev/6a166b57-f740-436b-8d48-f1c3b32f0791', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              brand_id: parseInt(brandId),
              model_id: null,
              service_id: parseInt(serviceId),
              base_price: numericPrice,
              currency: '₽',
            }),
          }).then(res => {
            if (res.ok) {
              successCount++;
              return { success: true };
            } else {
              errorCount++;
              return { success: false };
            }
          }).catch(() => {
            errorCount++;
            return { success: false };
          });
        });

        await Promise.all(batchPromises);
      }

      handleOpenChange(false);
      onSave();
      
      if (errorCount > 0) {
        alert(`Создано цен: ${successCount}\nОшибок: ${errorCount}\n\nНекоторые цены не удалось сохранить.`);
      } else {
        alert(`Успешно создано ${successCount} цен!`);
      }
    } catch (error) {
      console.error('Error bulk saving prices:', error);
      alert('Ошибка при сохранении цен');
    }
  };

  const handleSingleSave = async () => {
    if (!priceForm.brand_id || !priceForm.service_id || !priceForm.price) {
      alert('Заполните обязательные поля');
      return;
    }
    await onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl">
        <DialogHeader>
          <DialogTitle>{priceForm.id ? 'Редактировать цену' : 'Добавить цену'}</DialogTitle>
          <DialogDescription>
            {bulkMode ? 'Выберите бренды и услуги, укажите цену для каждой услуги' : 'Укажите бренд, услугу и цену'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
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
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="bulk-mode" 
                checked={bulkMode}
                onCheckedChange={(checked) => {
                  setBulkMode(checked as boolean);
                  if (checked) {
                    setSelectedBrands([]);
                    setSelectedServices([]);
                    setServicePrices({});
                  }
                }}
              />
              <Label htmlFor="bulk-mode" className="cursor-pointer">
                Массовое добавление
              </Label>
            </div>
          </div>

          {bulkMode ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Бренды *</Label>
                <Input
                  placeholder="Поиск бренда..."
                  value={searchBrand}
                  onChange={(e) => setSearchBrand(e.target.value)}
                  className="mb-2"
                />
                <ScrollArea className="h-64 rounded-md border p-2">
                  <div className="space-y-2">
                    {filteredBrands.map((brand) => (
                      <div key={brand.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand.id}`}
                          checked={selectedBrands.includes(brand.id.toString())}
                          onCheckedChange={() => toggleBrand(brand.id.toString())}
                        />
                        <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer flex-1">
                          {brand.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-sm text-muted-foreground mt-1">
                  Выбрано: {selectedBrands.length}
                </p>
              </div>

              <div>
                <Label>Услуги и цены *</Label>
                <Input
                  placeholder="Поиск услуги..."
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                  className="mb-2"
                />
                <ScrollArea className="h-64 rounded-md border p-2">
                  <div className="space-y-3">
                    {filteredServices.map((service) => (
                      <div key={service.id} className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service.id}`}
                            checked={selectedServices.includes(service.id.toString())}
                            onCheckedChange={() => toggleService(service.id.toString())}
                          />
                          <Label htmlFor={`service-${service.id}`} className="cursor-pointer flex-1 font-medium">
                            {service.title}
                          </Label>
                        </div>
                        {selectedServices.includes(service.id.toString()) && (
                          <Input
                            placeholder="Цена, ₽"
                            value={servicePrices[service.id.toString()] || ''}
                            onChange={(e) => updateServicePrice(service.id.toString(), e.target.value)}
                            className="ml-6 h-8"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-sm text-muted-foreground mt-1">
                  Выбрано: {selectedServices.length}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <Label>Бренд *</Label>
                <Input
                  placeholder="Поиск бренда..."
                  value={searchBrand}
                  onChange={(e) => setSearchBrand(e.target.value)}
                  className="mb-2"
                />
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={priceForm.brand_id} 
                  onChange={(e) => {
                    setPriceForm({ ...priceForm, brand_id: e.target.value, model_id: '' });
                    setSearchBrand('');
                  }}
                >
                  <option value="">Выберите бренд</option>
                  {filteredBrands.map((brand) => (
                    <option key={brand.id} value={brand.id.toString()}>
                      {brand.name}
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
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={priceForm.service_id} 
                  onChange={(e) => {
                    setPriceForm({ ...priceForm, service_id: e.target.value });
                    setSearchService('');
                  }}
                >
                  <option value="">Выберите услугу</option>
                  {filteredServices.map((service) => (
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
            </>
          )}

          {bulkMode && selectedBrands.length > 0 && selectedServices.length > 0 && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">
                Будет создано {selectedBrands.length * selectedServices.length} цен
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedBrands.length} {selectedBrands.length === 1 ? 'бренд' : 'брендов'} × {selectedServices.length} {selectedServices.length === 1 ? 'услуга' : 'услуг'}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={bulkMode ? handleBulkSave : handleSingleSave} className="flex-1">
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