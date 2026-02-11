import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Brand {
  id: number;
  name: string;
}

interface VehiclesBrandsTabProps {
  brands: Brand[];
  onRefresh: () => void;
}

const VehiclesBrandsTab = ({ brands, onRefresh }: VehiclesBrandsTabProps) => {
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [brandForm, setBrandForm] = useState({ id: 0, name: '' });

  const handleSaveBrand = async () => {
    if (!brandForm.name) return;
    
    try {
      const url = 'https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f';
      const method = brandForm.id ? 'PUT' : 'POST';
      const body = brandForm.id ? { id: brandForm.id, name: brandForm.name } : { name: brandForm.name };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsBrandDialogOpen(false);
        setBrandForm({ id: 0, name: '' });
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm('Удалить этот бренд? Будут удалены все связанные модели и цены.')) return;

    try {
      const response = await fetch('https://functions.poehali.dev/6e998d6c-035e-480a-b85e-9b690fa6733a', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        onRefresh();
      } else {
        alert(data.error || 'Ошибка при удалении бренда');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Ошибка при удалении бренда');
    }
  };

  return (
    <TabsContent value="brands">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Бренды автомобилей</CardTitle>
            <Button onClick={() => {
              setBrandForm({ id: 0, name: '' });
              setIsBrandDialogOpen(true);
            }}>
              <Icon name="Plus" className="mr-2" size={18} />
              Добавить бренд
            </Button>
          </div>
          <CardDescription>Список всех брендов автомобилей</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.id}</TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setBrandForm({ id: brand.id, name: brand.name });
                      setIsBrandDialogOpen(true);
                    }}>
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteBrand(brand.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{brandForm.id ? 'Редактировать бренд' : 'Добавить бренд'}</DialogTitle>
            <DialogDescription>Укажите название бренда автомобиля</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название бренда</Label>
              <Input
                value={brandForm.name}
                onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                placeholder="Toyota"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveBrand} className="flex-1">
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setIsBrandDialogOpen(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default VehiclesBrandsTab;