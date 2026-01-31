import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  // Dialog states
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Form states
  const [brandForm, setBrandForm] = useState({ id: 0, name: '' });
  const [modelForm, setModelForm] = useState({ id: 0, brand_id: '', name: '', year_from: '', year_to: '' });
  const [priceForm, setPriceForm] = useState({ id: 0, brand_id: '', model_id: '', service_id: '', price: '' });
  
  // Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'brands' | 'models' | 'prices'>('brands');

  // Filters
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');

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

  // Brand operations
  const handleSaveBrand = async () => {
    if (!brandForm.name) return;
    
    try {
      const url = 'https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f';
      const method = brandForm.id ? 'PUT' : 'POST';
      const body = brandForm.id ? { id: brandForm.id, name: brandForm.name } : { name: brandForm.name };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsBrandDialogOpen(false);
        setBrandForm({ id: 0, name: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm('Удалить этот бренд? Будут удалены все связанные модели и цены.')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  // Model operations
  const handleSaveModel = async () => {
    if (!modelForm.name || !modelForm.brand_id) return;

    try {
      const url = 'https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b';
      const method = modelForm.id ? 'PUT' : 'POST';
      const body = {
        ...(modelForm.id && { id: modelForm.id }),
        brand_id: parseInt(modelForm.brand_id),
        name: modelForm.name,
        year_from: modelForm.year_from ? parseInt(modelForm.year_from) : null,
        year_to: modelForm.year_to ? parseInt(modelForm.year_to) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsModelDialogOpen(false);
        setModelForm({ id: 0, brand_id: '', name: '', year_from: '', year_to: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error saving model:', error);
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!confirm('Удалить эту модель?')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  // Price operations
  const handleSavePrice = async () => {
    if (!priceForm.brand_id || !priceForm.service_id || !priceForm.price) return;

    try {
      const url = 'https://functions.poehali.dev/238c471e-a087-4373-8dcf-cec9258e7a04';
      const method = priceForm.id ? 'PUT' : 'POST';
      const body = {
        ...(priceForm.id && { id: priceForm.id }),
        brand_id: parseInt(priceForm.brand_id),
        model_id: priceForm.model_id ? parseInt(priceForm.model_id) : null,
        service_id: parseInt(priceForm.service_id),
        price: priceForm.price,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsPriceDialogOpen(false);
        setPriceForm({ id: 0, brand_id: '', model_id: '', service_id: '', price: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error saving price:', error);
    }
  };

  const handleDeletePrice = async (id: number) => {
    if (!confirm('Удалить эту цену?')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/238c471e-a087-4373-8dcf-cec9258e7a04?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error deleting price:', error);
    }
  };

  // File upload
  const handleFileUpload = async () => {
    if (!uploadFile) return;

    try {
      const data = await uploadFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (uploadType === 'brands') {
        // Expected columns: name
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
        // Expected columns: brand_name, model_name, year_from, year_to
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
        // Expected columns: brand_name, model_name, service_title, price
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
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      fetchData();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ошибка при загрузке файла');
    }
  };

  // Filtered data
  const filteredModels = filterBrand === 'all' ? models : models.filter(m => m.brand_id.toString() === filterBrand);
  const filteredPrices = prices.filter(p => {
    if (filterBrand !== 'all' && p.brand_id.toString() !== filterBrand) return false;
    if (filterService !== 'all' && p.service_id.toString() !== filterService) return false;
    return true;
  });

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

          {/* Brands Tab */}
          <TabsContent value="brands">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Бренды автомобилей</CardTitle>
                  <Button onClick={() => {
                    setBrandForm({ id: 0, name: '' });
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
                            setBrandForm({ id: brand.id, name: brand.name });
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
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Модели автомобилей</CardTitle>
                  <div className="flex gap-2">
                    <Select value={filterBrand} onValueChange={setFilterBrand}>
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
                    <Button onClick={() => {
                      setModelForm({ id: 0, brand_id: '', name: '', year_from: '', year_to: '' });
                      setIsModelDialogOpen(true);
                    }}>
                      <Icon name="Plus" className="mr-2" size={18} />
                      Добавить модель
                    </Button>
                  </div>
                </div>
                <CardDescription>Модели для каждого бренда ({filteredModels.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Бренд</TableHead>
                      <TableHead>Модель</TableHead>
                      <TableHead>Годы выпуска</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModels.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.brand_name}</TableCell>
                        <TableCell>{model.name}</TableCell>
                        <TableCell>
                          {model.year_from || '—'} {model.year_to ? `— ${model.year_to}` : '— н.в.'}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setModelForm({
                              id: model.id,
                              brand_id: model.brand_id.toString(),
                              name: model.name,
                              year_from: model.year_from?.toString() || '',
                              year_to: model.year_to?.toString() || '',
                            });
                            setIsModelDialogOpen(true);
                          }}>
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteModel(model.id)}>
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prices Tab */}
          <TabsContent value="prices">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Цены на услуги</CardTitle>
                  <div className="flex gap-2">
                    <Select value={filterBrand} onValueChange={setFilterBrand}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Бренд" />
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
                    <Select value={filterService} onValueChange={setFilterService}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Услуга" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все услуги</SelectItem>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => {
                      setPriceForm({ id: 0, brand_id: '', model_id: '', service_id: '', price: '' });
                      setIsPriceDialogOpen(true);
                    }}>
                      <Icon name="Plus" className="mr-2" size={18} />
                      Добавить цену
                    </Button>
                  </div>
                </div>
                <CardDescription>Цены на услуги для брендов и моделей ({filteredPrices.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Бренд</TableHead>
                      <TableHead>Модель</TableHead>
                      <TableHead>Услуга</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrices.map((price) => (
                      <TableRow key={price.id}>
                        <TableCell className="font-medium">{price.brand_name}</TableCell>
                        <TableCell>{price.model_name || 'Все модели'}</TableCell>
                        <TableCell>{price.service_title}</TableCell>
                        <TableCell className="font-bold text-primary">{price.price}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setPriceForm({
                              id: price.id,
                              brand_id: price.brand_id.toString(),
                              model_id: price.model_id?.toString() || '',
                              service_id: price.service_id.toString(),
                              price: price.price,
                            });
                            setIsPriceDialogOpen(true);
                          }}>
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePrice(price.id)}>
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Brand Dialog */}
        <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{brandForm.id ? 'Редактировать бренд' : 'Добавить бренд'}</DialogTitle>
              <DialogDescription>Укажите название бренда автомобиля</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Название бренда</Label>
                <Input
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  placeholder="Toyota"
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

        {/* Model Dialog */}
        <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modelForm.id ? 'Редактировать модель' : 'Добавить модель'}</DialogTitle>
              <DialogDescription>Укажите бренд, название и годы выпуска</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Бренд</Label>
                <Select value={modelForm.brand_id} onValueChange={(value) => setModelForm({ ...modelForm, brand_id: value })}>
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
                <Label>Название модели</Label>
                <Input
                  value={modelForm.name}
                  onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                  placeholder="Camry"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Год от</Label>
                  <Input
                    type="number"
                    value={modelForm.year_from}
                    onChange={(e) => setModelForm({ ...modelForm, year_from: e.target.value })}
                    placeholder="2010"
                  />
                </div>
                <div>
                  <Label>Год до</Label>
                  <Input
                    type="number"
                    value={modelForm.year_to}
                    onChange={(e) => setModelForm({ ...modelForm, year_to: e.target.value })}
                    placeholder="2020"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveModel} className="flex-1">
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => setIsModelDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Price Dialog */}
        <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{priceForm.id ? 'Редактировать цену' : 'Добавить цену'}</DialogTitle>
              <DialogDescription>Укажите бренд, модель (опционально), услугу и цену</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Бренд</Label>
                <Select value={priceForm.brand_id} onValueChange={(value) => setPriceForm({ ...priceForm, brand_id: value, model_id: '' })}>
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
                <Label>Модель (опционально)</Label>
                <Select value={priceForm.model_id} onValueChange={(value) => setPriceForm({ ...priceForm, model_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все модели" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все модели</SelectItem>
                    {models
                      .filter(m => m.brand_id.toString() === priceForm.brand_id)
                      .map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Услуга</Label>
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
              <div>
                <Label>Цена</Label>
                <Input
                  value={priceForm.price}
                  onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                  placeholder="5 000 ₽"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSavePrice} className="flex-1">
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
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
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminVehiclesPage;
