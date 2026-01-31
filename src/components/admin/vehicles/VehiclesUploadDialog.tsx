import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import * as XLSX from 'xlsx';

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

interface VehiclesUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  models: Model[];
  services: Service[];
  onRefresh: () => void;
}

const VehiclesUploadDialog = ({ isOpen, onClose, brands, models, services, onRefresh }: VehiclesUploadDialogProps) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'brands' | 'models' | 'prices'>('brands');

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    try {
      const data = await uploadFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (uploadType === 'brands') {
        for (const row of jsonData as any[]) {
          if (row.name) {
            await fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: row.name }),
            });
          }
        }
      } else if (uploadType === 'models') {
        for (const row of jsonData as any[]) {
          const brand = brands.find(b => b.name === row.brand_name);
          if (brand && row.model_name) {
            await fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                brand_id: brand.id,
                name: row.model_name,
                year_from: row.year_from || null,
                year_to: row.year_to || null,
              }),
            });
          }
        }
      } else if (uploadType === 'prices') {
        for (const row of jsonData as any[]) {
          const brand = brands.find(b => b.name === row.brand_name);
          const model = row.model_name ? models.find(m => m.name === row.model_name && m.brand_id === brand?.id) : null;
          const service = services.find(s => s.title === row.service_title);
          
          if (brand && service && row.price) {
            await fetch('https://functions.poehali.dev/238c471e-a087-4373-8dcf-cec9258e7a04', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                brand_id: brand.id,
                model_id: model?.id || null,
                service_id: service.id,
                price: row.price,
              }),
            });
          }
        }
      }

      alert('Данные успешно загружены!');
      onClose();
      setUploadFile(null);
      onRefresh();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ошибка при загрузке файла');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Загрузить из XLS файла</DialogTitle>
          <DialogDescription>Выберите тип данных и файл для загрузки</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Тип данных</Label>
            <Select value={uploadType} onValueChange={(value: any) => setUploadType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brands">Бренды</SelectItem>
                <SelectItem value="models">Модели</SelectItem>
                <SelectItem value="prices">Цены</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Файл XLS/XLSX</Label>
            <Input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="font-semibold mb-2">Формат файла:</p>
            {uploadType === 'brands' && (
              <p>Колонка: <code>name</code></p>
            )}
            {uploadType === 'models' && (
              <p>Колонки: <code>brand_name, model_name, year_from, year_to</code></p>
            )}
            {uploadType === 'prices' && (
              <p>Колонки: <code>brand_name, model_name, service_title, price</code></p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleFileUpload} disabled={!uploadFile} className="flex-1">
              <Icon name="Upload" className="mr-2" size={18} />
              Загрузить
            </Button>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehiclesUploadDialog;
