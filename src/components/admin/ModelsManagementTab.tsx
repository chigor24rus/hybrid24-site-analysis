import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { Brand, Model, ModelTag } from './types';

interface ModelsManagementTabProps {
  brands: Brand[];
  models: Model[];
  onUpdate: () => void;
}

const ModelsManagementTab = ({ brands, models, onUpdate }: ModelsManagementTabProps) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState({ name: '', year_from: '', year_to: '', brand_id: '', tag_ids: [] as number[] });
  const [availableTags, setAvailableTags] = useState<ModelTag[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'csv' | 'json'>('csv');
  const [uploadBrand, setUploadBrand] = useState<string>('');

  console.log('ModelsManagementTab received:', { brands: brands.length, models: models.length });

  // Загрузка тегов при монтировании
  useState(() => {
    fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b/tags')
      .then(res => res.json())
      .then(data => setAvailableTags(data.tags || []))
      .catch(err => console.error('Failed to load tags:', err));
  });

  let filteredModels = selectedBrand === 'all'
    ? models
    : models.filter(m => m.brand_id.toString() === selectedBrand);

  // Фильтр по тегам
  if (selectedTags.length > 0) {
    filteredModels = filteredModels.filter(model => 
      selectedTags.every(tagId => model.tags?.some(tag => tag.id === tagId))
    );
  }

  console.log('Filtered models:', filteredModels.length);

  const handleAddModel = async () => {
    if (!formData.name || !formData.brand_id) return;

    try {
      const response = await fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: parseInt(formData.brand_id),
          name: formData.name,
          year_from: formData.year_from ? parseInt(formData.year_from) : null,
          year_to: formData.year_to ? parseInt(formData.year_to) : null,
          tag_ids: formData.tag_ids,
        }),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        setFormData({ name: '', year_from: '', year_to: '', brand_id: '' });
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding model:', error);
    }
  };

  const handleUpdateModel = async () => {
    if (!editingModel || !formData.name) return;

    try {
      const response = await fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingModel.id,
          name: formData.name,
          year_from: formData.year_from ? parseInt(formData.year_from) : null,
          year_to: formData.year_to ? parseInt(formData.year_to) : null,
          tag_ids: formData.tag_ids,
        }),
      });

      if (response.ok) {
        setEditingModel(null);
        setFormData({ name: '', year_from: '', year_to: '', brand_id: '' });
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating model:', error);
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!confirm('Удалить эту модель?')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !uploadBrand) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result;
      if (!content) return;

      const base64Content = btoa(content as string);

      try {
        const response = await fetch('https://functions.poehali.dev/158713b5-5bec-4512-afed-3075eb5db319', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand_id: parseInt(uploadBrand),
            type: uploadType,
            file: base64Content,
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          alert(`Успешно загружено: ${result.added}\nПропущено: ${result.skipped}`);
          setIsUploadDialogOpen(false);
          setUploadFile(null);
          setUploadBrand('');
          onUpdate();
        } else {
          alert(`Ошибка: ${result.error}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Ошибка при загрузке файла');
      }
    };

    reader.readAsText(uploadFile);
  };

  const openEditDialog = (model: Model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      year_from: model.year_from?.toString() || '',
      year_to: model.year_to?.toString() || '',
      brand_id: model.brand_id.toString(),
      tag_ids: model.tags?.map(t => t.id) || [],
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Модели автомобилей ({filteredModels.length})</CardTitle>
            <div className="flex gap-2">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
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
              <div className="flex gap-1.5 items-center border rounded-md px-3 bg-background">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Теги:</span>
                <div className="flex gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          setSelectedTags(prev => 
                            isSelected 
                              ? prev.filter(id => id !== tag.id)
                              : [...prev, tag.id]
                          );
                        }}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all"
                        style={{
                          backgroundColor: isSelected ? tag.color : tag.color + '20',
                          color: isSelected ? '#ffffff' : tag.color,
                          border: `1px solid ${tag.color}`
                        }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button onClick={() => setIsUploadDialogOpen(true)} variant="outline">
                <Icon name="Upload" className="mr-2" size={18} />
                Загрузить из файла
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Icon name="Plus" className="mr-2" size={18} />
                Добавить модель
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Бренд</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Годы выпуска</TableHead>
                <TableHead>Теги</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Нет моделей
                  </TableCell>
                </TableRow>
              ) : (
                filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.brand_name}</TableCell>
                    <TableCell>{model.name}</TableCell>
                    <TableCell>
                      {model.year_from || '—'} {model.year_to ? `— ${model.year_to}` : '— н.в.'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {model.tags && model.tags.length > 0 ? (
                          model.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(model)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteModel(model.id)}>
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || !!editingModel} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingModel(null);
          setFormData({ name: '', year_from: '', year_to: '', brand_id: '', tag_ids: [] });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModel ? 'Редактировать модель' : 'Добавить модель'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingModel && (
              <div>
                <label className="text-sm font-medium mb-2 block">Бренд</label>
                <Select value={formData.brand_id} onValueChange={(val) => setFormData({ ...formData, brand_id: val })}>
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
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">Название модели</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: RAV4"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Год от</label>
                <Input
                  type="number"
                  value={formData.year_from}
                  onChange={(e) => setFormData({ ...formData, year_from: e.target.value })}
                  placeholder="2010"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Год до</label>
                <Input
                  type="number"
                  value={formData.year_to}
                  onChange={(e) => setFormData({ ...formData, year_to: e.target.value })}
                  placeholder="2023"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Теги</label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                {availableTags.length === 0 ? (
                  <span className="text-sm text-muted-foreground">Загрузка тегов...</span>
                ) : (
                  availableTags.map((tag) => {
                    const isSelected = formData.tag_ids.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            tag_ids: isSelected
                              ? prev.tag_ids.filter(id => id !== tag.id)
                              : [...prev.tag_ids, tag.id]
                          }));
                        }}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                        style={{
                          backgroundColor: isSelected ? tag.color : tag.color + '20',
                          color: isSelected ? '#ffffff' : tag.color,
                          border: `2px solid ${tag.color}`
                        }}
                      >
                        {tag.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            <Button onClick={editingModel ? handleUpdateModel : handleAddModel} className="w-full">
              {editingModel ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить модели из файла</DialogTitle>
            <DialogDescription>
              Поддерживаются форматы CSV и JSON. CSV должен содержать колонки: name, year_from, year_to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Бренд</label>
              <Select value={uploadBrand} onValueChange={setUploadBrand}>
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
              <label className="text-sm font-medium mb-2 block">Формат файла</label>
              <Select value={uploadType} onValueChange={(val: 'csv' | 'json') => setUploadType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Файл</label>
              <Input
                type="file"
                accept={uploadType === 'csv' ? '.csv' : '.json'}
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button onClick={handleFileUpload} className="w-full" disabled={!uploadFile || !uploadBrand}>
              <Icon name="Upload" className="mr-2" size={18} />
              Загрузить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelsManagementTab;