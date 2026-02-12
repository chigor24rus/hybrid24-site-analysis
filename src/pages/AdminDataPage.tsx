import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import BrandManagementTab from '@/components/admin/BrandManagementTab';
import PriceManagementTab from '@/components/admin/PriceManagementTab';
import { Brand, Service, Price } from '@/components/admin/types';

const AdminDataPage = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [brandsRes, servicesRes, pricesRes] = await Promise.all([
        fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
        fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc'),
        fetch('https://functions.poehali.dev/0cce410b-a4a1-4420-8df0-90d95a5055b7'),
      ]);
      
      const brandsData = await brandsRes.json();
      const servicesData = await servicesRes.json();
      const pricesData = await pricesRes.json();
      
      setBrands(brandsData.brands || []);
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
            <h1 className="text-4xl font-bold mb-2">Управление данными</h1>
            <p className="text-muted-foreground">Редактирование брендов и цен</p>
          </div>
          <div className="flex gap-2">
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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="brands">Бренды ({brands.length})</TabsTrigger>
            <TabsTrigger value="prices">Цены ({prices.length})</TabsTrigger>
          </TabsList>

          <BrandManagementTab brands={brands} onRefresh={fetchData} />
          <PriceManagementTab prices={prices} brands={brands} services={services} onRefresh={fetchData} />
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDataPage;