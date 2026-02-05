import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout, AdminPageHeader } from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { API_ENDPOINTS } from '@/utils/apiClient';

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, adminPassword } = useAdminAuth();
  const [yandexOrgId, setYandexOrgId] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceEndTime, setMaintenanceEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const savedOrgId = localStorage.getItem('yandexMapsOrgId');
    if (savedOrgId) {
      setYandexOrgId(savedOrgId);
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.settings.get);
        const data = await response.json();
        setMaintenanceMode(data.maintenanceMode);
        setMaintenanceEndTime(data.maintenanceEndTime);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('yandexMapsOrgId', yandexOrgId);
      
      if (!adminPassword) {
        toast({
          title: "Требуется повторная авторизация",
          description: "Пожалуйста, войдите в систему снова",
          variant: "destructive",
        });
        logout();
        navigate('/admin/login');
        return;
      }

      const response = await fetch(API_ENDPOINTS.settings.update, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': `Bearer ${adminPassword}`
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
    <AdminLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <AdminPageHeader
            title="Настройки"
            description="Интеграция с внешними сервисами"
            actions={
              <>
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  <Icon name="ArrowLeft" className="mr-2" size={18} />
                  Назад
                </Button>
                <Button variant="outline" onClick={logout}>
                  <Icon name="LogOut" className="mr-2" size={18} />
                  Выйти
                </Button>
              </>
            }
          />

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
    </AdminLayout>
  );
};

export default AdminSettingsPage;