import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
}

interface Service {
  id: number;
  title: string;
}

interface Price {
  id: number;
  service_id: number;
  brand_id: number;
  base_price: number;
  currency: string;
  service_title: string;
  brand_name: string;
}

const AdminDataPage = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Brand modal state
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({ name: '', slug: '', logo_url: '', description: '' });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Price modal state
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);
  const [priceForm, setPriceForm] = useState({ service_id: '', brand_id: '', base_price: '' });

  // Check auth
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

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [brandsRes, servicesRes, pricesRes] = await Promise.all([
        fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f'),
        fetch('https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc'),
        fetch('https://functions.poehali.dev/238c471e-a087-4373-8dcf-cec9258e7a04'),
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

  // Brand operations
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

      const response = await fetch('https://functions.poehali.dev/2083652a-f56c-4d58-85e2-2e0af2b8a48a', {
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
        fetchData();
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
        fetchData();
      } else {
        alert(data.error || 'Ошибка при удалении бренда');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Ошибка при удалении бренда');
    }
  };

  // Price operations
  const openPriceModal = (price?: Price) => {
    if (price) {
      setEditingPrice(price);
      setPriceForm({
        service_id: price.service_id.toString(),
        brand_id: price.brand_id.toString(),
        base_price: price.base_price.toString(),
      });
    } else {
      setEditingPrice(null);
      setPriceForm({ service_id: '', brand_id: '', base_price: '' });
    }
    setPriceModalOpen(true);
  };

  const savePrice = async () => {
    try {
      const method = editingPrice ? 'PUT' : 'POST';
      const body = editingPrice
        ? { id: editingPrice.id, base_price: parseFloat(priceForm.base_price) }
        : {
            service_id: parseInt(priceForm.service_id),
            brand_id: parseInt(priceForm.brand_id),
            base_price: parseFloat(priceForm.base_price),
          };

      const response = await fetch('https://functions.poehali.dev/238c471e-a087-4373-8dcf-cec9258e7a04', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setPriceModalOpen(false);
        fetchData();
      } else {
        alert(data.error || 'Ошибка при сохранении цены');
      }
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Ошибка при сохранении цены');
    }
  };

  const deletePrice = async (id: number) => {
    if (!confirm('Удалить эту цену?')) return;
    
    try {
      const response = await fetch('https://functions.poehali.dev/238c471e-a087-4373-8dcf-cec9258e7a04', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        fetchData();
      } else {
        alert(data.error || 'Ошибка при удалении цены');
      }
    } catch (error) {
      console.error('Error deleting price:', error);
      alert('Ошибка при удалении цены');
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

          <TabsContent value="prices" className="space-y-4">
            <Button onClick={() => openPriceModal()} className="gradient-primary">
              <Icon name="Plus" className="mr-2" size={18} />
              Добавить цену
            </Button>

            <div className="space-y-2">
              {prices.map((price) => (
                <Card key={price.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{price.brand_name}</div>
                        <div className="text-sm text-muted-foreground">{price.service_title}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-primary">
                          {price.base_price.toLocaleString()} {price.currency}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openPriceModal(price)}>
                            <Icon name="Edit" size={14} />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deletePrice(price.id)}>
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Brand Modal */}
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

        {/* Price Modal */}
        <Dialog open={priceModalOpen} onOpenChange={setPriceModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPrice ? 'Редактировать цену' : 'Добавить цену'}</DialogTitle>
              <DialogDescription>Укажите цену услуги для бренда</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {!editingPrice && (
                <>
                  <div className="space-y-2">
                    <Label>Бренд *</Label>
                    <Select value={priceForm.brand_id} onValueChange={(value) => setPriceForm({ ...priceForm, brand_id: value })}>
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
                  <div className="space-y-2">
                    <Label>Услуга *</Label>
                    <Select value={priceForm.service_id} onValueChange={(value) => setPriceForm({ ...priceForm, service_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите услугу" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Цена (₽) *</Label>
                <Input
                  type="number"
                  value={priceForm.base_price}
                  onChange={(e) => setPriceForm({ ...priceForm, base_price: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setPriceModalOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={savePrice} className="gradient-primary">
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDataPage;