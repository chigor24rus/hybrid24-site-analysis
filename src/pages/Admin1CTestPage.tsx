import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface TestResult {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

const Admin1CTestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null);
  const [metadataResult, setMetadataResult] = useState<TestResult | null>(null);
  const [servicesResult, setServicesResult] = useState<TestResult | null>(null);
  const [orderResult, setOrderResult] = useState<TestResult | null>(null);
  const [schemaResult, setSchemaResult] = useState<TestResult | null>(null);

  const [testOrderData, setTestOrderData] = useState({
    customer_name: 'Иван Тестов',
    customer_phone: '+79991234567',
    customer_email: 'test@example.com',
    service_type: 'Диагностика',
    car_brand: 'Toyota',
    car_model: 'Camry',
    preferred_date: new Date().toISOString().split('T')[0],
    preferred_time: '10:00',
    comment: 'Тестовый заказ из админки'
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const testConnection = async () => {
    setLoading(true);
    setConnectionResult(null);
    try {
      const response = await fetch('https://functions.poehali.dev/1a8a5028-260f-4d4c-8b91-294a21afdd86');
      const data = await response.json();
      
      setConnectionResult({
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error || 'Ошибка подключения',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setConnectionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testMetadata = async () => {
    setLoading(true);
    setMetadataResult(null);
    try {
      const response = await fetch('https://functions.poehali.dev/1a8a5028-260f-4d4c-8b91-294a21afdd86?action=metadata');
      const data = await response.json();
      
      setMetadataResult({
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error || 'Ошибка получения метаданных',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setMetadataResult({
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testServices = async () => {
    setLoading(true);
    setServicesResult(null);
    try {
      const response = await fetch('https://functions.poehali.dev/1a8a5028-260f-4d4c-8b91-294a21afdd86?action=services');
      const data = await response.json();
      
      setServicesResult({
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error || 'Ошибка получения услуг',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setServicesResult({
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testSchema = async () => {
    setLoading(true);
    setSchemaResult(null);
    try {
      const response = await fetch('https://functions.poehali.dev/1a8a5028-260f-4d4c-8b91-294a21afdd86?action=schema&entity=Document_ЗаявкаНаРемонт');
      const data = await response.json();
      setSchemaResult({
        success: data.success,
        data: data,
        error: data.success ? undefined : data.error || 'Ошибка',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setSchemaResult({
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateOrder = async () => {
    setLoading(true);
    setOrderResult(null);
    try {
      const response = await fetch('https://functions.poehali.dev/1a8a5028-260f-4d4c-8b91-294a21afdd86', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testOrderData),
      });
      const data = await response.json();
      
      setOrderResult({
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error || 'Ошибка создания заказа',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setOrderResult({
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const renderResult = (result: TestResult | null) => {
    if (!result) return null;

    return (
      <div className={`mt-4 p-4 rounded-lg border ${
        result.success 
          ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
          : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-start gap-2 mb-2">
          <Icon 
            name={result.success ? 'CheckCircle2' : 'XCircle'} 
            size={20} 
            className={result.success ? 'text-green-600' : 'text-red-600'}
          />
          <div className="flex-1">
            <p className="font-semibold">
              {result.success ? 'Успешно' : 'Ошибка'}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(result.timestamp).toLocaleString('ru-RU')}
            </p>
          </div>
        </div>
        
        {result.error && (
          <div className="mt-2 p-2 bg-background rounded text-sm">
            <p className="text-red-600 font-mono">{result.error}</p>
          </div>
        )}
        
        {result.data && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Показать данные
            </summary>
            <pre className="p-3 bg-background rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Тест интеграции с 1С</h1>
            <p className="text-muted-foreground">Проверка подключения через OData</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <Icon name="ArrowLeft" className="mr-2" size={18} />
            Назад
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Plug" size={20} />
                Проверка подключения
              </CardTitle>
              <CardDescription>
                Базовая проверка доступности 1С через OData
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testConnection} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Icon name="Loader" className="mr-2 animate-spin" size={18} />
                ) : (
                  <Icon name="Play" className="mr-2" size={18} />
                )}
                Проверить подключение
              </Button>
              {renderResult(connectionResult)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Database" size={20} />
                Метаданные
              </CardTitle>
              <CardDescription>
                Получить список доступных сущностей из 1С
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testMetadata} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Icon name="Loader" className="mr-2 animate-spin" size={18} />
                ) : (
                  <Icon name="Play" className="mr-2" size={18} />
                )}
                Получить метаданные
              </Button>
              {renderResult(metadataResult)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="List" size={20} />
                Список услуг
              </CardTitle>
              <CardDescription>
                Получить каталог услуг из 1С
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testServices} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Icon name="Loader" className="mr-2 animate-spin" size={18} />
                ) : (
                  <Icon name="Play" className="mr-2" size={18} />
                )}
                Получить услуги
              </Button>
              {renderResult(servicesResult)}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileSearch" size={20} />
                Схема Document_ЗаявкаНаРемонт
              </CardTitle>
              <CardDescription>
                Получить реальные поля документа заявки на ремонт из 1С
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testSchema}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <Icon name="Loader" className="mr-2 animate-spin" size={18} />
                ) : (
                  <Icon name="Play" className="mr-2" size={18} />
                )}
                Получить поля документа
              </Button>
              {renderResult(schemaResult)}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShoppingCart" size={20} />
                Создание заказа
              </CardTitle>
              <CardDescription>
                Тестовая отправка заказа в 1С
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Имя клиента</Label>
                    <Input
                      value={testOrderData.customer_name}
                      onChange={(e) => setTestOrderData({ ...testOrderData, customer_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Телефон</Label>
                    <Input
                      value={testOrderData.customer_phone}
                      onChange={(e) => setTestOrderData({ ...testOrderData, customer_phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={testOrderData.customer_email}
                      onChange={(e) => setTestOrderData({ ...testOrderData, customer_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Услуга</Label>
                    <Input
                      value={testOrderData.service_type}
                      onChange={(e) => setTestOrderData({ ...testOrderData, service_type: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Марка авто</Label>
                    <Input
                      value={testOrderData.car_brand}
                      onChange={(e) => setTestOrderData({ ...testOrderData, car_brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Модель авто</Label>
                    <Input
                      value={testOrderData.car_model}
                      onChange={(e) => setTestOrderData({ ...testOrderData, car_model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Дата</Label>
                    <Input
                      type="date"
                      value={testOrderData.preferred_date}
                      onChange={(e) => setTestOrderData({ ...testOrderData, preferred_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Время</Label>
                    <Input
                      type="time"
                      value={testOrderData.preferred_time}
                      onChange={(e) => setTestOrderData({ ...testOrderData, preferred_time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Комментарий</Label>
                  <Textarea
                    value={testOrderData.comment}
                    onChange={(e) => setTestOrderData({ ...testOrderData, comment: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <Button 
                onClick={testCreateOrder} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Icon name="Loader" className="mr-2 animate-spin" size={18} />
                ) : (
                  <Icon name="Send" className="mr-2" size={18} />
                )}
                Создать тестовый заказ
              </Button>
              {renderResult(orderResult)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin1CTestPage;