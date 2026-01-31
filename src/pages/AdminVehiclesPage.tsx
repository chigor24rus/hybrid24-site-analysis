import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import VehiclesBrandsTab from '@/components/admin/vehicles/VehiclesBrandsTab';
import VehiclesModelsTab from '@/components/admin/vehicles/VehiclesModelsTab';
import VehiclesPricesTab from '@/components/admin/vehicles/VehiclesPricesTab';
import VehiclesUploadDialog from '@/components/admin/vehicles/VehiclesUploadDialog';

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
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    const authTime = localStorage.getItem('adminAuthTime');
    
    if (!isAuthenticated || !authTime) {
      navigate('/admin/login');
      return;
    }
    
    const hoursSinceAuth = (Date.now() - parseInt(authTime)) / (1000 * 60 * 60);
    if (hoursSinceAuth > 24) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminAuthTime');
      navigate('/admin/login');
    }
  }, [navigate]);

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
        fetch('https://functions.poehali.dev/238c471e-a087-4373-8dcf-cec9258e7a04'),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Управление автомобилями</h1>
            <p className="text-muted-foreground">Бренды, модели и цены на услуги</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
              <Icon name="Upload" className="mr-2" size={18} />
              Загрузить из XLS
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <Icon name="ArrowLeft" className="mr-2" size={18} />
              К заявкам
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem('adminAuth');
                localStorage.removeItem('adminAuthTime');
                navigate('/admin/login');
              }}
            >
              <Icon name="LogOut" className="mr-2" size={18} />
              Выйти
            </Button>
          </div>
        </div>

        <Tabs defaultValue="brands" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="brands">Бренды ({brands.length})</TabsTrigger>
            <TabsTrigger value="models">Модели ({models.length})</TabsTrigger>
            <TabsTrigger value="prices">Цены ({prices.length})</TabsTrigger>
          </TabsList>

          <VehiclesBrandsTab brands={brands} onRefresh={fetchData} />
          <VehiclesModelsTab brands={brands} models={models} onRefresh={fetchData} />
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
  );
};

export default AdminVehiclesPage;
