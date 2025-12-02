import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [yandexOrgId, setYandexOrgId] = useState('');
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
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('yandexMapsOrgId', yandexOrgId);
      
      toast({
        title: "Настройки сохранены",
        description: "ID организации успешно обновлён",
      });
      
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
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
              disabled={loading || !yandexOrgId.trim()}
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
