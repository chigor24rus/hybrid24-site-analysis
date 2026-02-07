import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
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

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      if (uploadType === 'brands') {
        for (const row of jsonData as any[]) {
          if (row.name) {
            try {
              const response = await fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: row.name }),
              });
              const result = await response.json();
              if (response.ok) {
                successCount++;
              } else {
                errorCount++;
                errors.push(`Бренд "${row.name}": ${result.error || 'неизвестная ошибка'}`);
              }
            } catch (err) {
              errorCount++;
              errors.push(`Бренд "${row.name}": ошибка сети`);
            }
          }
        }
      } else if (uploadType === 'models') {
        for (const row of jsonData as any[]) {
          const brand = brands.find(b => b.name === row.brand_name);
          if (!brand) {
            errorCount++;
            errors.push(`Модель "${row.model_name}": бренд "${row.brand_name}" не найден`);
            continue;
          }
          if (!row.model_name) {
            errorCount++;
            errors.push(`Строка пропущена: отсутствует название модели`);
            continue;
          }
          
          try {
            const response = await fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                brand_id: brand.id,
                name: row.model_name,
                year_from: row.year_from || null,
                year_to: row.year_to || null,
              }),
            });
            const result = await response.json();
            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
              errors.push(`Модель "${row.model_name}": ${result.error || 'неизвестная ошибка'}`);
            }
          } catch (err) {
            errorCount++;
            errors.push(`Модель "${row.model_name}": ошибка сети`);
          }
        }
      } else if (uploadType === 'prices') {
        for (const row of jsonData as any[]) {
          const brand = brands.find(b => b.name === row.brand_name);
          if (!brand) {
            errorCount++;
            errors.push(`Цена: бренд "${row.brand_name}" не найден`);
            continue;
          }
          
          const model = row.model_name ? models.find(m => m.name === row.model_name && m.brand_id === brand?.id) : null;
          const service = services.find(s => s.title === row.service_title);
          
          if (!service) {
            errorCount++;
            errors.push(`Цена: услуга "${row.service_title}" не найдена`);
            continue;
          }
          
          if (!row.price) {
            errorCount++;
            errors.push(`Цена для "${row.service_title}": отсутствует значение`);
            continue;
          }
          
          try {
            const response = await fetch('https://functions.poehali.dev/238c471e-a087-4373-8dcf-cec9258e7a04', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                brand_id: brand.id,
                model_id: model?.id || null,
                service_id: service.id,
                price: row.price,
              }),
            });
            const result = await response.json();
            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
              errors.push(`Цена: ${result.error || 'неизвестная ошибка'}`);
            }
          } catch (err) {
            errorCount++;
            errors.push(`Цена: ошибка сети`);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Успешно загружено записей: ${successCount}`);
      }
      
      if (errorCount > 0) {
        const errorMessage = errors.length > 0 
          ? `Ошибок: ${errorCount}. Первые ошибки:\n${errors.slice(0, 3).join('\n')}` 
          : `Ошибок: ${errorCount}`;
        toast.error(errorMessage);
        console.error('Upload errors:', errors);
      }
      
      if (successCount === 0 && errorCount === 0) {
        toast.warning('Файл не содержит данных для загрузки');
      }
      
      onClose();
      setUploadFile(null);
      onRefresh();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Ошибка при обработке файла: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-2">
                <p className="font-semibold text-blue-900 dark:text-blue-100">Инструкция по заполнению:</p>
                
                {uploadType === 'brands' && (
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                    <li>• Скачайте файл-пример ниже</li>
                    <li>• Откройте его в Excel или Google Таблицах</li>
                    <li>• Заполните колонку <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">name</code> названиями брендов</li>
                    <li>• Пример: <span className="italic">Toyota, BMW, Mercedes-Benz</span></li>
                    <li>• Сохраните файл в формате .xlsx или .csv</li>
                    <li>• Загрузите файл через форму ниже</li>
                  </ul>
                )}

                {uploadType === 'models' && (
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                    <li>• Скачайте файл-пример ниже</li>
                    <li>• Заполните колонки:</li>
                    <li className="ml-4">
                      → <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">brand_name</code> — название бренда (должен существовать в системе)
                    </li>
                    <li className="ml-4">
                      → <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">model_name</code> — название модели
                    </li>
                    <li className="ml-4">
                      → <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">year_from</code> — год начала выпуска (можно оставить пустым)
                    </li>
                    <li className="ml-4">
                      → <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">year_to</code> — год окончания выпуска (оставьте пустым для текущих)
                    </li>
                    <li>• Пример: <span className="italic">Toyota, Camry, 2010, 2023</span></li>
                  </ul>
                )}

                {uploadType === 'prices' && (
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                    <li>• Скачайте файл-пример ниже</li>
                    <li>• Заполните колонки:</li>
                    <li className="ml-4">
                      → <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">brand_name</code> — название бренда (должен существовать)
                    </li>
                    <li className="ml-4">
                      → <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">model_name</code> — модель (оставьте пустым для всех моделей бренда)
                    </li>
                    <li className="ml-4">
                      → <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">service_title</code> — название услуги (должна существовать)
                    </li>
                    <li className="ml-4">
                      → <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">price</code> — цена (например: "от 8 500 ₽")
                    </li>
                    <li>• Если model_name пустой — цена применится ко всем моделям бренда</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm space-y-3">
            <div>
              <p className="font-semibold mb-2">Формат файла:</p>
              {uploadType === 'brands' && (
                <p>Колонка: <code className="bg-background px-1 py-0.5 rounded">name</code></p>
              )}
              {uploadType === 'models' && (
                <p>Колонки: <code className="bg-background px-1 py-0.5 rounded">brand_name, model_name, year_from, year_to</code></p>
              )}
              {uploadType === 'prices' && (
                <p>Колонки: <code className="bg-background px-1 py-0.5 rounded">brand_name, model_name, service_title, price</code></p>
              )}
            </div>
            <div className="pt-2 border-t border-border">
              <p className="font-semibold mb-2">Скачать пример:</p>
              <div className="flex flex-wrap gap-2">
                {uploadType === 'brands' && (
                  <a href="/examples/brands_example.csv" download className="inline-flex items-center gap-1 text-primary hover:underline">
                    <Icon name="Download" size={14} />
                    brands_example.csv
                  </a>
                )}
                {uploadType === 'models' && (
                  <a href="/examples/models_example.csv" download className="inline-flex items-center gap-1 text-primary hover:underline">
                    <Icon name="Download" size={14} />
                    models_example.csv
                  </a>
                )}
                {uploadType === 'prices' && (
                  <a href="/examples/prices_example.csv" download className="inline-flex items-center gap-1 text-primary hover:underline">
                    <Icon name="Download" size={14} />
                    prices_example.csv
                  </a>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label>Файл XLS/XLSX/CSV</Label>
            <Input
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
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