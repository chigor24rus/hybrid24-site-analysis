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
  slug?: string;
  logo_url?: string;
  description?: string;
}

interface VehiclesBrandsTabProps {
  brands: Brand[];
  onRefresh: () => void;
}

const VehiclesBrandsTab = ({ brands, onRefresh }: VehiclesBrandsTabProps) => {
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [brandForm, setBrandForm] = useState({ id: 0, name: '', slug: '', logo_url: '', description: '' });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const uploadLogoFile = async (file: File) => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://functions.poehali.dev/0c2538b8-020a-4ffa-a9dc-cb7b0574de2b', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok && data.url) {
        setBrandForm({ ...brandForm, logo_url: data.url });
      } else {
        alert(data.error || 'Ошибка при загрузке файла');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Ошибка при загрузке файла');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveBrand = async () => {
    if (!brandForm.name) return;
    
    try {
      const url = 'https://functions.poehali.dev/6e998d6c-035e-480a-b85e-9b690fa6733a';
      const method = brandForm.id ? 'PUT' : 'POST';
      const body = brandForm.id 
        ? { id: brandForm.id, name: brandForm.name, slug: brandForm.slug, logo_url: brandForm.logo_url, description: brandForm.description } 
        : { name: brandForm.name, slug: brandForm.slug, logo_url: brandForm.logo_url, description: brandForm.description };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsBrandDialogOpen(false);
        setBrandForm({ id: 0, name: '', slug: '', logo_url: '', description: '' });
        onRefresh();
      } else {
        alert(data.error || 'Ошибка при сохранении бренда');
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
              setBrandForm({ id: 0, name: '', slug: '', logo_url: '', description: '' });
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
                      setBrandForm({ 
                        id: brand.id, 
                        name: brand.name, 
                        slug: brand.slug || '', 
                        logo_url: brand.logo_url || '', 
                        description: brand.description || '' 
                      });
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
              <Label>Название бренда *</Label>
              <Input
                value={brandForm.name}
                onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                placeholder="Toyota"
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input
                value={brandForm.slug}
                onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })}
                placeholder="toyota (будет сгенерирован автоматически)"
              />
            </div>
            <div>
              <Label>Логотип</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadLogoFile(file);
                  }}
                  disabled={uploadingLogo}
                  className="flex-1"
                />
                {uploadingLogo && <Icon name="Loader" className="animate-spin" size={20} />}
              </div>
              {brandForm.logo_url && (
                <div className="mt-2">
                  <img src={brandForm.logo_url} alt="Preview" className="h-16 object-contain" />
                </div>
              )}
              <Input
                value={brandForm.logo_url}
                onChange={(e) => setBrandForm({ ...brandForm, logo_url: e.target.value })}
                placeholder="Или вставьте URL логотипа"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Описание</Label>
              <Input
                value={brandForm.description}
                onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                placeholder="Краткое описание бренда"
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