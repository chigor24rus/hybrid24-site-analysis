import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

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
  const [priceForm, setPriceForm] = useState({ id: 0, brand_id: '', model_id: '', service_id: '', price: '' });
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [searchBrand, setSearchBrand] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [searchService, setSearchService] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredPrices = prices.filter(p => {
    if (filterBrand !== 'all' && p.brand_id.toString() !== filterBrand) return false;
    if (filterService !== 'all' && p.service_id.toString() !== filterService) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredPrices.length / itemsPerPage);
  const paginatedPrices = filteredPrices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSavePrice = async () => {
    if (!priceForm.brand_id || !priceForm.service_id || !priceForm.price) return;

    try {
      const url = 'https://functions.poehali.dev/238c471e-a087-4373-8dcf-cec9258e7a04';
      const method = priceForm.id ? 'PUT' : 'POST';
      const body = {
        ...(priceForm.id && { id: priceForm.id }),
        brand_id: parseInt(priceForm.brand_id),
        model_id: priceForm.model_id ? parseInt(priceForm.model_id) : null,
        service_id: parseInt(priceForm.service_id),
        price: priceForm.price,
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
      }
    } catch (error) {
      console.error('Error saving price:', error);
    }
  };

  const handleDeletePrice = async (id: number) => {
    if (!confirm('Удалить эту цену?')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/238c471e-a087-4373-8dcf-cec9258e7a04?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) onRefresh();
    } catch (error) {
      console.error('Error deleting price:', error);
    }
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Бренд</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Услуга</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPrices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell className="font-medium">{price.brand_name}</TableCell>
                  <TableCell>{price.model_name || 'Все модели'}</TableCell>
                  <TableCell>{price.service_title}</TableCell>
                  <TableCell className="font-bold text-primary">{price.price}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setPriceForm({
                        id: price.id,
                        brand_id: price.brand_id.toString(),
                        model_id: price.model_id?.toString() || '',
                        service_id: price.service_id.toString(),
                        price: price.price,
                      });
                      setIsPriceDialogOpen(true);
                    }}>
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePrice(price.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Показано {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredPrices.length)} из {filteredPrices.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <Icon name="ChevronsLeft" size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <Icon name="ChevronLeft" size={16} />
                </Button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm font-medium">{currentPage}</span>
                  <span className="text-sm text-muted-foreground">из {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Icon name="ChevronRight" size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <Icon name="ChevronsRight" size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isPriceDialogOpen && (
        <Dialog open={isPriceDialogOpen} onOpenChange={(open) => {
          setIsPriceDialogOpen(open);
          if (!open) {
            setSearchBrand('');
            setSearchModel('');
            setSearchService('');
          }
        }}>
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
                <Button onClick={handleSavePrice} className="flex-1">
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </TabsContent>
  );
};

export default VehiclesPricesTab;