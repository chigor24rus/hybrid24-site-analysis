import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePriceDialogLogic } from './price-dialog/usePriceDialogLogic';
import PriceDialogBulkMode from './price-dialog/PriceDialogBulkMode';
import PriceDialogSingleMode from './price-dialog/PriceDialogSingleMode';
import type { PriceDialogProps } from './price-dialog/PriceDialogTypes';

const PriceDialog = ({ 
  isOpen, 
  onOpenChange, 
  priceForm, 
  setPriceForm, 
  brands, 
  models, 
  services,
  prices,
  onSave,
  onRefresh
}: PriceDialogProps) => {
  const {
    searchBrand,
    setSearchBrand,
    searchService,
    setSearchService,
    onlyNoPrices,
    setOnlyNoPrices,
    selectedBrands,
    selectedServices,
    servicePrices,
    bulkMode,
    setBulkMode,
    filteredBrands,
    filteredServices,
    toggleBrand,
    toggleService,
    updateServicePrice,
    handleBulkSave,
    handleOpenChange,
    setSelectedBrands,
    setSelectedServices,
    setServicePrices,
  } = usePriceDialogLogic(brands, services, prices, onOpenChange, onRefresh);

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
            <PriceDialogBulkMode
              filteredBrands={filteredBrands}
              filteredServices={filteredServices}
              searchBrand={searchBrand}
              setSearchBrand={setSearchBrand}
              searchService={searchService}
              setSearchService={setSearchService}
              selectedBrands={selectedBrands}
              selectedServices={selectedServices}
              servicePrices={servicePrices}
              toggleBrand={toggleBrand}
              toggleService={toggleService}
              updateServicePrice={updateServicePrice}
            />
          ) : (
            <PriceDialogSingleMode
              priceForm={priceForm}
              setPriceForm={setPriceForm}
              filteredBrands={filteredBrands}
              filteredServices={filteredServices}
              searchBrand={searchBrand}
              setSearchBrand={setSearchBrand}
              searchService={searchService}
              setSearchService={setSearchService}
            />
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
