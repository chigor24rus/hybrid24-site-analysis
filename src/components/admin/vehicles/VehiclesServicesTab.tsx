import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
}

interface VehiclesServicesTabProps {
  services: Service[];
  onRefresh: () => void;
}

const VehiclesServicesTab = ({ services, onRefresh }: VehiclesServicesTabProps) => {
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ 
    id: 0, 
    title: '', 
    description: '', 
    icon: 'Wrench', 
    duration: '1-2 часа' 
  });

  const handleSaveService = async () => {
    if (!serviceForm.title) {
      alert('Укажите название услуги');
      return;
    }

    try {
      // Пока функция не задеплоена, покажем alert
      alert('Функция управления услугами находится в процессе развёртывания. Пожалуйста, попробуйте позже.');
      return;

      // Код для будущего использования после деплоя
      // const url = 'URL_ФУНКЦИИ';
      // const method = serviceForm.id ? 'PUT' : 'POST';
      // const body = serviceForm.id 
      //   ? serviceForm
      //   : { title: serviceForm.title, description: serviceForm.description, icon: serviceForm.icon, duration: serviceForm.duration };

      // const response = await fetch(url, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(body),
      // });

      // if (response.ok) {
      //   setIsServiceDialogOpen(false);
      //   setServiceForm({ id: 0, title: '', description: '', icon: 'Wrench', duration: '1-2 часа' });
      //   onRefresh();
      // }
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Удалить эту услугу?')) return;

    try {
      alert('Функция управления услугами находится в процессе развёртывания. Пожалуйста, попробуйте позже.');
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  return (
    <TabsContent value="services">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Услуги</CardTitle>
            <Button onClick={() => {
              setServiceForm({ id: 0, title: '', description: '', icon: 'Wrench', duration: '1-2 часа' });
              setIsServiceDialogOpen(true);
            }}>
              <Icon name="Plus" className="mr-2" size={18} />
              Добавить услугу
            </Button>
          </div>
          <CardDescription>Управление услугами автосервиса ({services.length})</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Иконка</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.title}</TableCell>
                  <TableCell className="max-w-md truncate">{service.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Icon name={service.icon as any} size={14} className="mr-1" />
                      {service.icon}
                    </Badge>
                  </TableCell>
                  <TableCell>{service.duration}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setServiceForm({
                        id: service.id,
                        title: service.title,
                        description: service.description,
                        icon: service.icon,
                        duration: service.duration,
                      });
                      setIsServiceDialogOpen(true);
                    }}>
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isServiceDialogOpen && (
        <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{serviceForm.id ? 'Редактировать услугу' : 'Добавить услугу'}</DialogTitle>
              <DialogDescription>Укажите информацию об услуге</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Название *</Label>
                <Input
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="Диагностика электрики"
                />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Подробное описание услуги..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Иконка</Label>
                <Input
                  value={serviceForm.icon}
                  onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  placeholder="Wrench"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Название иконки из библиотеки lucide-react (например: Wrench, Battery, Zap)
                </p>
              </div>
              <div>
                <Label>Длительность</Label>
                <Input
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                  placeholder="1-2 часа"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveService} className="flex-1">
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </TabsContent>
  );
};

export default VehiclesServicesTab;
