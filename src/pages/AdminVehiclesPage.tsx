import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import VehiclesBrandsTab from '@/components/admin/vehicles/VehiclesBrandsTab';
import VehiclesModelsTab from '@/components/admin/vehicles/VehiclesModelsTab';
import VehiclesPricesTab from '@/components/admin/vehicles/VehiclesPricesTab';
import VehiclesServicesTab from '@/components/admin/vehicles/VehiclesServicesTab';
import VehiclesUploadDialog from '@/components/admin/vehicles/VehiclesUploadDialog';
import { AdminLayout, LoadingScreen, AdminPageHeader, AdminActionButton } from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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

const AdminVehiclesPage = () => {
  const { logout } = useAdminAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [brandsRes, modelsRes, servicesRes, pricesRes] = await Promise.all([
        fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
        fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b'),
        fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc'),
        fetch('https://functions.poehali.dev/6a166b57-f740-436b-8d48-f1c3b32f0791'),
      ]);
      
      const [brandsData, modelsData, servicesData, pricesData] = await Promise.all([
        brandsRes.json(),
        modelsRes.json(),
        servicesRes.json(),
        pricesRes.json(),
      ]);
      
      setBrands(brandsData.brands || []);
      setModels(modelsData.models || []);
      setServices(servicesData.services || []);
      setPrices(pricesData.prices || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!confirm('Удалить все дубликаты моделей? Останется только самая первая запись каждой модели.')) {
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b?action=remove_duplicates', {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (response.ok) {
        alert(`Успешно удалено дубликатов: ${result.deleted}`);
        fetchData();
      } else {
        alert(`Ошибка: ${result.error}`);
      }
    } catch (error) {
      console.error('Error removing duplicates:', error);
      alert('Ошибка при удалении дубликатов');
    }
  };

  const handleNormalizeBrands = async () => {
    if (!confirm('Привести все названия брендов к единому формату (первая буква заглавная, остальные строчные)?')) {
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/45453f6e-7337-46e0-a603-53c35ea5605f', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (response.ok) {
        alert(`Успешно обновлено брендов: ${result.updated} из ${result.total}`);
        fetchData();
      } else {
        alert(`Ошибка при нормализации`);
      }
    } catch (error) {
      console.error('Error normalizing brands:', error);
      alert('Ошибка при нормализации брендов');
    }
  };

  const handleImportLogos = async () => {
    if (!confirm('Загрузить логотипы всех брендов из Car Logos Dataset (GitHub)? Это займет несколько минут.')) {
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/68543ce4-24ca-4f4d-9ecc-7756d3540704', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        const message = `Загружено логотипов: ${result.uploaded} из ${result.total_brands}\nПропущено: ${result.skipped}`;
        if (result.errors && result.errors.length > 0) {
          alert(message + '\n\nНе найдены:\n' + result.errors.slice(0, 5).join('\n'));
        } else {
          alert(message);
        }
        fetchData();
      } else {
        alert(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error importing logos:', error);
      alert('Ошибка при загрузке логотипов');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <AdminPageHeader
            title="Управление автомобилями"
            description="Бренды, модели и цены на услуги"
            showBackButton
            actions={
              <>
                <AdminActionButton
                  icon="ExternalLink"
                  label="SEO-страницы"
                  onClick={() => window.open('/services-index', '_blank')}
                  variant="outline"
                />
                <AdminActionButton
                  icon="Type"
                  label="Нормализовать регистр"
                  onClick={handleNormalizeBrands}
                  variant="outline"
                />
                <AdminActionButton
                  icon="Trash2"
                  label="Удалить дубликаты"
                  onClick={handleRemoveDuplicates}
                  variant="outline"
                />
                <AdminActionButton
                  icon="Upload"
                  label="Загрузить из XLS"
                  onClick={() => setIsUploadDialogOpen(true)}
                  variant="outline"
                />
                <AdminActionButton
                  icon="Image"
                  label="Загрузить логотипы"
                  onClick={handleImportLogos}
                  variant="outline"
                />
                <AdminActionButton
                  icon="LogOut"
                  label="Выйти"
                  onClick={logout}
                  variant="outline"
                />
              </>
            }
          />

        <Tabs defaultValue="brands" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="brands">Бренды ({brands.length})</TabsTrigger>
            <TabsTrigger value="models">Модели ({models.length})</TabsTrigger>
            <TabsTrigger value="services">Услуги ({services.length})</TabsTrigger>
            <TabsTrigger value="prices">Цены ({prices.length})</TabsTrigger>
          </TabsList>

          <VehiclesBrandsTab brands={brands} onRefresh={fetchData} />
          <VehiclesModelsTab brands={brands} models={models} onRefresh={fetchData} />
          <VehiclesServicesTab services={services} onRefresh={fetchData} />
          <VehiclesPricesTab brands={brands} models={models} services={services} prices={prices} onRefresh={fetchData} />
        </Tabs>

        <VehiclesUploadDialog
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          brands={brands}
          models={models}
          services={services}
          onRefresh={fetchData}
        />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVehiclesPage;