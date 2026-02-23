import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { TestResult } from '@/components/admin1c/TestResultBlock';
import { OrderData } from '@/components/admin1c/CreateOrderCard';
import ConnectionTestCards from '@/components/admin1c/ConnectionTestCards';
import CreateOrderCard from '@/components/admin1c/CreateOrderCard';

const API_URL = 'https://functions.poehali.dev/1a8a5028-260f-4d4c-8b91-294a21afdd86';

const Admin1CTestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null);
  const [metadataResult, setMetadataResult] = useState<TestResult | null>(null);
  const [servicesResult, setServicesResult] = useState<TestResult | null>(null);
  const [orderResult, setOrderResult] = useState<TestResult | null>(null);
  const [schemaResult, setSchemaResult] = useState<TestResult | null>(null);
  const [readDocResult, setReadDocResult] = useState<TestResult | null>(null);
  const [readOrgResult, setReadOrgResult] = useState<TestResult | null>(null);
  const [readZnResult, setReadZnResult] = useState<TestResult | null>(null);

  const [testOrderData, setTestOrderData] = useState<OrderData>({
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
      const response = await fetch(API_URL);
      const data = await response.json();
      setConnectionResult({
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error || 'Ошибка подключения',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setConnectionResult({ success: false, error: error instanceof Error ? error.message : 'Ошибка', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const testMetadata = async () => {
    setLoading(true);
    setMetadataResult(null);
    try {
      const response = await fetch(`${API_URL}?action=metadata`);
      const data = await response.json();
      setMetadataResult({
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error || 'Ошибка получения метаданных',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setMetadataResult({ success: false, error: error instanceof Error ? error.message : 'Ошибка', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const testServices = async () => {
    setLoading(true);
    setServicesResult(null);
    try {
      const response = await fetch(`${API_URL}?action=services`);
      const data = await response.json();
      setServicesResult({
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error || 'Ошибка получения услуг',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setServicesResult({ success: false, error: error instanceof Error ? error.message : 'Ошибка', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const testSchema = async () => {
    setLoading(true);
    setSchemaResult(null);
    try {
      const response = await fetch(`${API_URL}?action=schema&entity=Document_ЗаявкаНаРемонт`);
      const data = await response.json();
      setSchemaResult({
        success: data.success,
        data: data,
        error: data.success ? undefined : data.error || 'Ошибка',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setSchemaResult({ success: false, error: error instanceof Error ? error.message : 'Ошибка', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const testReadDoc = async () => {
    setLoading(true);
    setReadDocResult(null);
    try {
      const response = await fetch(`${API_URL}?action=read_doc`);
      const data = await response.json();
      setReadDocResult({
        success: data.success !== false,
        data: data,
        error: data.success === false ? data.error : undefined,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setReadDocResult({ success: false, error: error instanceof Error ? error.message : 'Ошибка', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const testReadOrg = async () => {
    setLoading(true);
    setReadOrgResult(null);
    try {
      const response = await fetch(`${API_URL}?action=read_org`);
      const data = await response.json();
      setReadOrgResult({
        success: data.success !== false,
        data: data,
        error: data.success === false ? data.error : undefined,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setReadOrgResult({ success: false, error: error instanceof Error ? error.message : 'Ошибка', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const testReadZn = async () => {
    setLoading(true);
    setReadZnResult(null);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const kontragentKey = urlParams.get('kontragent_key') || '';
      const qs = kontragentKey ? `&kontragent_key=${encodeURIComponent(kontragentKey)}` : '';
      const response = await fetch(`${API_URL}?action=read_zn${qs}`);
      const data = await response.json();
      setReadZnResult({
        success: data.success !== false,
        data: data,
        error: data.success === false ? data.error : undefined,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      setReadZnResult({ success: false, error: error instanceof Error ? error.message : 'Ошибка', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const testCreateOrder = async () => {
    setLoading(true);
    setOrderResult(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setOrderResult({ success: false, error: error instanceof Error ? error.message : 'Ошибка', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
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
          <ConnectionTestCards
            loading={loading}
            connectionResult={connectionResult}
            metadataResult={metadataResult}
            servicesResult={servicesResult}
            schemaResult={schemaResult}
            readDocResult={readDocResult}
            readOrgResult={readOrgResult}
            readZnResult={readZnResult}
            onTestConnection={testConnection}
            onTestMetadata={testMetadata}
            onTestServices={testServices}
            onTestSchema={testSchema}
            onTestReadDoc={testReadDoc}
            onTestReadOrg={testReadOrg}
            onTestReadZn={testReadZn}
          />

          <CreateOrderCard
            loading={loading}
            orderResult={orderResult}
            testOrderData={testOrderData}
            onOrderDataChange={setTestOrderData}
            onCreateOrder={testCreateOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default Admin1CTestPage;