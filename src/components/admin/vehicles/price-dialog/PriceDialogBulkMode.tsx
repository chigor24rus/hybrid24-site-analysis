import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Brand, Model, Service } from './PriceDialogTypes';

interface PriceDialogBulkModeProps {
  filteredBrands: Brand[];
  filteredModels: Model[];
  filteredServices: Service[];
  searchBrand: string;
  setSearchBrand: (value: string) => void;
  searchModel: string;
  setSearchModel: (value: string) => void;
  searchService: string;
  setSearchService: (value: string) => void;
  selectedBrands: string[];
  selectedModels: string[];
  selectedServices: string[];
  servicePrices: Record<string, string>;
  toggleBrand: (brandId: string) => void;
  toggleModel: (modelId: string) => void;
  toggleService: (serviceId: string) => void;
  updateServicePrice: (serviceId: string, price: string) => void;
}

const PriceDialogBulkMode = ({
  filteredBrands,
  filteredModels,
  filteredServices,
  searchBrand,
  setSearchBrand,
  searchModel,
  setSearchModel,
  searchService,
  setSearchService,
  selectedBrands,
  selectedModels,
  selectedServices,
  servicePrices,
  toggleBrand,
  toggleModel,
  toggleService,
  updateServicePrice,
}: PriceDialogBulkModeProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
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
        <Label>Модели</Label>
        <Input
          placeholder="Поиск модели..."
          value={searchModel}
          onChange={(e) => setSearchModel(e.target.value)}
          className="mb-2"
        />
        <ScrollArea className="h-64 rounded-md border p-2">
          <div className="space-y-2">
            {selectedBrands.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Выберите бренд</p>
            ) : filteredModels.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Нет моделей</p>
            ) : (
              filteredModels.map((model) => (
                <div key={model.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`model-${model.id}`}
                    checked={selectedModels.includes(model.id.toString())}
                    onCheckedChange={() => toggleModel(model.id.toString())}
                  />
                  <Label htmlFor={`model-${model.id}`} className="cursor-pointer flex-1 text-sm">
                    {model.name}
                  </Label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <p className="text-sm text-muted-foreground mt-1">
          Выбрано: {selectedModels.length}
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
  );
};

export default PriceDialogBulkMode;