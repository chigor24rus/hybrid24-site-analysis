import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [yandexOrgId, setYandexOrgId] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceEndTime, setMaintenanceEndTime] = useState('');
  const [loading, setLoading] = useState(false);

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
      return;
    }

    const savedOrgId = localStorage.getItem('yandexMapsOrgId');
    if (savedOrgId) {
      setYandexOrgId(savedOrgId);
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/8bc3c490-c0ac-4106-91a2-e809a9fb2cdf');
        const data = await response.json();
        setMaintenanceMode(data.maintenanceMode);
        setMaintenanceEndTime(data.maintenanceEndTime);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('yandexMapsOrgId', yandexOrgId);
      
      const adminPassword = localStorage.getItem('adminAuth');
      
      // If old session (adminAuth='true'), redirect to login
      if (adminPassword === 'true' || !adminPassword) {
        toast({
          title: "Требуется повторная авторизация",
          description: "Пожалуйста, войдите в систему снова",
          variant: "destructive",
        });
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminAuthTime');
        navigate('/admin/login');
        return;
      }
      
      const response = await fetch('https://functions.poehali.dev/731360dc-a17d-4bc3-b22a-974f46b9bac2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`
        },
        body: JSON.stringify({
          maintenanceMode,
          maintenanceEndTime
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      toast({
        title: "Настройки сохранены",
        description: maintenanceMode 
          ? "Режим обслуживания включен. Посетители увидят страницу технических работ."
          : "Настройки успешно обновлены",
      });
      
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : "Не удалось сохранить настройки";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Настройки</h1>
            <p className="text-muted-foreground">Интеграция с внешними сервисами</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
          >
            <Icon name="ArrowLeft" className="mr-2" size={18} />
            Назад
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Wrench" size={24} />
              Режим обслуживания
            </CardTitle>
            <CardDescription>
              Временно закройте сайт для технических работ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="maintenance" className="text-base font-semibold cursor-pointer">
                  Сайт на обслуживании
                </Label>
                <p className="text-sm text-muted-foreground">
                  Посетители увидят страницу "Сайт находится на обслуживании"
                </p>
              </div>
              <Switch
                id="maintenance"
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>

            {maintenanceMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Планируемое время окончания (необязательно)</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={maintenanceEndTime}
                    onChange={(e) => setMaintenanceEndTime(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Если указать время, посетители увидят, когда планируется завершить работы
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon name="AlertTriangle" className="text-yellow-600 mt-0.5" size={20} />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-800 mb-1">Внимание!</p>
                      <p className="text-yellow-700">
                        После сохранения все посетители будут видеть страницу технических работ. 
                        Доступ к админ-панели сохранится.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="MapPin" size={24} />
              Яндекс.Карты
            </CardTitle>
            <CardDescription>
              Настройте автоматическую загрузку отзывов с Яндекс.Карт
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgId">ID организации на Яндекс.Картах</Label>
              <Input
                id="orgId"
                type="text"
                placeholder="Введите ID или название организации"
                value={yandexOrgId}
                onChange={(e) => setYandexOrgId(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Найдите свою компанию на <a href="https://yandex.ru/maps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Яндекс.Картах</a> и скопируйте название или адрес организации
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="Info" size={18} />
                Как найти ID организации?
              </h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Откройте страницу вашей компании на Яндекс.Картах</li>
                <li>Скопируйте полное название организации</li>
                <li>Или скопируйте адрес компании</li>
                <li>Вставьте в поле выше</li>
              </ol>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Icon name="Loader" className="mr-2 animate-spin" size={18} />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" className="mr-2" size={18} />
                  Сохранить настройки
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;