import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Brand } from './types';

interface BrandManagementTabProps {
  brands: Brand[];
  onRefresh: () => void;
}

const BrandManagementTab = ({ brands, onRefresh }: BrandManagementTabProps) => {
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({ name: '', slug: '', logo_url: '', description: '' });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const openBrandModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandForm({
        name: brand.name,
        slug: brand.slug,
        logo_url: brand.logo_url || '',
        description: brand.description || '',
      });
    } else {
      setEditingBrand(null);
      setBrandForm({ name: '', slug: '', logo_url: '', description: '' });
    }
    setBrandModalOpen(true);
  };

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

  const saveBrand = async () => {
    try {
      const method = editingBrand ? 'PUT' : 'POST';
      const body = editingBrand
        ? { ...brandForm, id: editingBrand.id }
        : brandForm;

      const response = await fetch('https://functions.poehali.dev/6e998d6c-035e-480a-b85e-9b690fa6733a', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setBrandModalOpen(false);
        onRefresh();
      } else {
        alert(data.error || 'Ошибка при сохранении бренда');
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      alert('Ошибка при сохранении бренда');
    }
  };

  const deleteBrand = async (id: number) => {
    if (!confirm('Удалить этот бренд? Все связанные цены также будут удалены.')) return;
    
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
    <>
      <TabsContent value="brands" className="space-y-4">
        <Button onClick={() => openBrandModal()} className="gradient-primary">
          <Icon name="Plus" className="mr-2" size={18} />
          Добавить бренд
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Card key={brand.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {brand.logo_url && (
                      <img src={brand.logo_url} alt={brand.name} className="h-12 object-contain mb-2" />
                    )}
                    <CardTitle className="text-lg">{brand.name}</CardTitle>
                    <CardDescription className="text-sm">Slug: {brand.slug}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{brand.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openBrandModal(brand)}>
                    <Icon name="Edit" size={14} className="mr-1" />
                    Изменить
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteBrand(brand.id)}>
                    <Icon name="Trash2" size={14} className="mr-1" />
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <Dialog open={brandModalOpen} onOpenChange={setBrandModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Редактировать бренд' : 'Добавить бренд'}</DialogTitle>
            <DialogDescription>Заполните информацию о бренде</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input
                value={brandForm.name}
                onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                placeholder="Toyota"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL) *</Label>
              <Input
                value={brandForm.slug}
                onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })}
                placeholder="toyota"
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={brandForm.description}
                onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                placeholder="Описание бренда..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBrandModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={saveBrand} className="gradient-primary">
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BrandManagementTab;