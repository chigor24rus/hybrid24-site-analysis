import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import PriceDialog from './PriceDialog';
import BulkUpdateDialog from './BulkUpdateDialog';
import PricesTable from './PricesTable';

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

interface VehiclesPricesTabProps {
  brands: Brand[];
  models: Model[];
  services: Service[];
  prices: Price[];
  onRefresh: () => void;
}

const VehiclesPricesTab = ({ brands, models, services, prices, onRefresh }: VehiclesPricesTabProps) => {
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [priceForm, setPriceForm] = useState({ id: 0, brand_id: '', model_id: '', service_id: '', price: '' });
  const [bulkForm, setBulkForm] = useState({ 
    brand_ids: [] as string[], 
    model_ids: [] as string[], 
    service_ids: [] as string[], 
    operation: 'set', 
    value: '' 
  });
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredPrices = prices.filter(p => {
    if (filterBrand !== 'all' && p.brand_id.toString() !== filterBrand) return false;
    if (filterModel !== 'all' && (p.model_id?.toString() || 'null') !== filterModel) return false;
    if (filterService !== 'all' && p.service_id.toString() !== filterService) return false;
    return true;
  });

  const availableModels = filterBrand !== 'all' 
    ? models.filter(m => m.brand_id.toString() === filterBrand)
    : models;

  const totalPages = Math.ceil(filteredPrices.length / itemsPerPage);

  const handleSavePrice = async () => {
    if (!priceForm.brand_id || !priceForm.service_id || !priceForm.price) return;

    try {
      const url = 'https://functions.poehali.dev/6a166b57-f740-436b-8d48-f1c3b32f0791';
      const method = priceForm.id ? 'PUT' : 'POST';
      
      // Extract numeric value from price string
      const numericPrice = parseFloat(priceForm.price.replace(/[^\d.]/g, ''));
      
      const body = {
        ...(priceForm.id && { id: priceForm.id }),
        brand_id: parseInt(priceForm.brand_id),
        model_id: priceForm.model_id ? parseInt(priceForm.model_id) : null,
        service_id: parseInt(priceForm.service_id),
        base_price: numericPrice,
        currency: '₽',
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsPriceDialogOpen(false);
        setPriceForm({ id: 0, brand_id: '', model_id: '', service_id: '', price: '' });
        onRefresh();
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || 'Не удалось сохранить цену'}`);
      }
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Ошибка при сохранении цены');
    }
  };

  const handleDeletePrice = async (id: number) => {
    if (!confirm('Удалить эту цену?')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/6a166b57-f740-436b-8d48-f1c3b32f0791?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) onRefresh();
    } catch (error) {
      console.error('Error deleting price:', error);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkForm.value || bulkForm.brand_ids.length === 0) {
      alert('Укажите бренды и значение для изменения');
      return;
    }

    const affectedPrices = prices.filter(p => {
      const brandMatch = bulkForm.brand_ids.includes(p.brand_id.toString());
      const modelMatch = bulkForm.model_ids.length === 0 || bulkForm.model_ids.includes(p.model_id?.toString() || '');
      const serviceMatch = bulkForm.service_ids.length === 0 || bulkForm.service_ids.includes(p.service_id.toString());
      return brandMatch && modelMatch && serviceMatch;
    });

    if (affectedPrices.length === 0) {
      alert('Нет цен, соответствующих выбранным критериям');
      return;
    }

    const confirmMessage = `Будет изменено ${affectedPrices.length} цен. Продолжить?`;
    if (!confirm(confirmMessage)) return;

    try {
      const updates = affectedPrices.map(async (price) => {
        // Extract numeric value from price string
        const currentValue = parseFloat(price.price.replace(/[^\d.]/g, ''));
        let newBasePrice = currentValue;
        
        if (bulkForm.operation === 'set') {
          newBasePrice = parseFloat(bulkForm.value.replace(/[^\d.]/g, ''));
        } else if (bulkForm.operation === 'increase') {
          const increaseValue = parseFloat(bulkForm.value.replace(/[^\d.]/g, ''));
          newBasePrice = currentValue + increaseValue;
        } else if (bulkForm.operation === 'decrease') {
          const decreaseValue = parseFloat(bulkForm.value.replace(/[^\d.]/g, ''));
          newBasePrice = Math.max(0, currentValue - decreaseValue);
        } else if (bulkForm.operation === 'multiply') {
          const multiplier = parseFloat(bulkForm.value);
          newBasePrice = Math.round(currentValue * multiplier);
        }

        return fetch('https://functions.poehali.dev/6a166b57-f740-436b-8d48-f1c3b32f0791', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: price.id,
            brand_id: price.brand_id,
            model_id: price.model_id,
            service_id: price.service_id,
            base_price: newBasePrice,
            currency: '₽',
          }),
        });
      });

      await Promise.all(updates);
      setIsBulkDialogOpen(false);
      setBulkForm({ brand_ids: [], model_ids: [], service_ids: [], operation: 'set', value: '' });
      onRefresh();
      alert('Цены успешно обновлены!');
    } catch (error) {
      console.error('Error bulk updating prices:', error);
      alert('Ошибка при обновлении цен');
    }
  };

  const handleEditPrice = (price: Price) => {
    setPriceForm({
      id: price.id,
      brand_id: price.brand_id.toString(),
      model_id: price.model_id?.toString() || '',
      service_id: price.service_id.toString(),
      price: price.price,
    });
    setIsPriceDialogOpen(true);
  };

  return (
    <TabsContent value="prices">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Цены на услуги</CardTitle>
            <div className="flex gap-2">
              <Select value={filterBrand} onValueChange={(value) => {
                setFilterBrand(value);
                setFilterModel('all');
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Бренд" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">Все бренды</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={filterModel} 
                onValueChange={(value) => {
                  setFilterModel(value);
                  setCurrentPage(1);
                }}
                disabled={filterBrand === 'all'}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Модель" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">Все модели</SelectItem>
                  <SelectItem value="null">Без модели</SelectItem>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterService} onValueChange={(value) => {
                setFilterService(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Услуга" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">Все услуги</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                onClick={() => {
                  setBulkForm({ brand_ids: [], model_ids: [], service_ids: [], operation: 'set', value: '' });
                  setIsBulkDialogOpen(true);
                }}
              >
                <Icon name="Settings" className="mr-2" size={18} />
                Массовое изменение
              </Button>
              <Button onClick={() => {
                console.log('Opening price dialog', { brands: brands.length, models: models.length, services: services.length });
                setPriceForm({ id: 0, brand_id: '', model_id: '', service_id: '', price: '' });
                setIsPriceDialogOpen(true);
              }}>
                <Icon name="Plus" className="mr-2" size={18} />
                Добавить цену
              </Button>
            </div>
          </div>
          <CardDescription>
            Цены на услуги для брендов и моделей ({filteredPrices.length})
            {totalPages > 1 && ` • Страница ${currentPage} из ${totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricesTable
            prices={filteredPrices}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onEdit={handleEditPrice}
            onDelete={handleDeletePrice}
          />
        </CardContent>
      </Card>

      <PriceDialog
        isOpen={isPriceDialogOpen}
        onOpenChange={setIsPriceDialogOpen}
        priceForm={priceForm}
        setPriceForm={setPriceForm}
        brands={brands}
        models={models}
        services={services}
        onSave={handleSavePrice}
      />

      <BulkUpdateDialog
        isOpen={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        bulkForm={bulkForm}
        setBulkForm={setBulkForm}
        brands={brands}
        models={models}
        services={services}
        prices={prices}
        onUpdate={handleBulkUpdate}
      />
    </TabsContent>
  );
};

export default VehiclesPricesTab;