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

interface VehiclesModelsTabProps {
  brands: Brand[];
  models: Model[];
  onRefresh: () => void;
}

const VehiclesModelsTab = ({ brands, models, onRefresh }: VehiclesModelsTabProps) => {
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [modelForm, setModelForm] = useState({ id: 0, brand_id: '', name: '', year_from: '', year_to: '' });
  const [filterBrand, setFilterBrand] = useState<string>('all');

  const filteredModels = filterBrand === 'all' ? models : models.filter(m => m.brand_id.toString() === filterBrand);

  const handleSaveModel = async () => {
    if (!modelForm.name || !modelForm.brand_id) return;

    try {
      const url = 'https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b';
      const method = modelForm.id ? 'PUT' : 'POST';
      const body = {
        ...(modelForm.id && { id: modelForm.id }),
        brand_id: parseInt(modelForm.brand_id),
        name: modelForm.name,
        year_from: modelForm.year_from ? parseInt(modelForm.year_from) : null,
        year_to: modelForm.year_to ? parseInt(modelForm.year_to) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsModelDialogOpen(false);
        setModelForm({ id: 0, brand_id: '', name: '', year_from: '', year_to: '' });
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving model:', error);
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!confirm('Удалить эту модель?')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) onRefresh();
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  return (
    <TabsContent value="models">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Модели автомобилей</CardTitle>
            <div className="flex gap-2">
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Все бренды" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все бренды</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => {
                setModelForm({ id: 0, brand_id: '', name: '', year_from: '', year_to: '' });
                setIsModelDialogOpen(true);
              }}>
                <Icon name="Plus" className="mr-2" size={18} />
                Добавить модель
              </Button>
            </div>
          </div>
          <CardDescription>Модели для каждого бренда ({filteredModels.length})</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Бренд</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Годы выпуска</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.brand_name}</TableCell>
                  <TableCell>{model.name}</TableCell>
                  <TableCell>
                    {model.year_from || '—'} {model.year_to ? `— ${model.year_to}` : '— н.в.'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setModelForm({
                        id: model.id,
                        brand_id: model.brand_id.toString(),
                        name: model.name,
                        year_from: model.year_from?.toString() || '',
                        year_to: model.year_to?.toString() || '',
                      });
                      setIsModelDialogOpen(true);
                    }}>
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteModel(model.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modelForm.id ? 'Редактировать модель' : 'Добавить модель'}</DialogTitle>
            <DialogDescription>Укажите бренд, название и годы выпуска</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Бренд</Label>
              <Select value={modelForm.brand_id} onValueChange={(value) => setModelForm({ ...modelForm, brand_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите бренд" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Название модели</Label>
              <Input
                value={modelForm.name}
                onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                placeholder="Camry"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Год от</Label>
                <Input
                  type="number"
                  value={modelForm.year_from}
                  onChange={(e) => setModelForm({ ...modelForm, year_from: e.target.value })}
                  placeholder="2010"
                />
              </div>
              <div>
                <Label>Год до</Label>
                <Input
                  type="number"
                  value={modelForm.year_to}
                  onChange={(e) => setModelForm({ ...modelForm, year_to: e.target.value })}
                  placeholder="2020"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveModel} className="flex-1">
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setIsModelDialogOpen(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default VehiclesModelsTab;
