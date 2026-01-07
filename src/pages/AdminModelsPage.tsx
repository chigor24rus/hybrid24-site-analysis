import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ModelsManagementTab from '@/components/admin/ModelsManagementTab';
import { Brand, Model } from '@/components/admin/types';

const AdminModelsPage = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
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
      const [brandsRes, modelsRes] = await Promise.all([
        fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
        fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b'),
      ]);
      
      const brandsData = await brandsRes.json();
      const modelsData = await modelsRes.json();
      
      setBrands(brandsData.brands || []);
      setModels(modelsData.models || []);
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
            <h1 className="text-4xl font-bold mb-2">Управление моделями</h1>
            <p className="text-muted-foreground">Модели автомобилей по брендам</p>
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

        <ModelsManagementTab
          brands={brands}
          models={models}
          onUpdate={fetchData}
        />
      </div>
    </div>
  );
};

export default AdminModelsPage;
