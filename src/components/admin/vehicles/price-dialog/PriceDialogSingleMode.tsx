import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Brand, Service, PriceForm } from './PriceDialogTypes';

interface PriceDialogSingleModeProps {
  priceForm: PriceForm;
  setPriceForm: (form: PriceForm) => void;
  filteredBrands: Brand[];
  filteredServices: Service[];
  searchBrand: string;
  setSearchBrand: (value: string) => void;
  searchService: string;
  setSearchService: (value: string) => void;
}

const PriceDialogSingleMode = ({
  priceForm,
  setPriceForm,
  filteredBrands,
  filteredServices,
  searchBrand,
  setSearchBrand,
  searchService,
  setSearchService,
}: PriceDialogSingleModeProps) => {
  return (
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
  );
};

export default PriceDialogSingleMode;
