import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { Promotion } from './types';

export const services = [
  {
    id: 1,
    title: 'Техническое обслуживание',
    description: 'Комплексная проверка и обслуживание автомобиля',
    price: 'от 3 500 ₽',
    duration: '2 часа',
    icon: 'Wrench'
  },
  {
    id: 2,
    title: 'Диагностика двигателя',
    description: 'Компьютерная диагностика и выявление неисправностей',
    price: 'от 1 500 ₽',
    duration: '1 час',
    icon: 'Settings'
  },
  {
    id: 3,
    title: 'Замена масла',
    description: 'Замена моторного масла и масляного фильтра',
    price: 'от 1 200 ₽',
    duration: '30 мин',
    icon: 'Droplet'
  },
  {
    id: 4,
    title: 'Шиномонтаж',
    description: 'Сезонная замена шин, балансировка',
    price: 'от 2 000 ₽',
    duration: '1 час',
    icon: 'Disc'
  },
  {
    id: 5,
    title: 'Ремонт ходовой',
    description: 'Диагностика и ремонт подвески автомобиля',
    price: 'от 5 000 ₽',
    duration: '3 часа',
    icon: 'Construction'
  },
  {
    id: 6,
    title: 'Кузовной ремонт',
    description: 'Восстановление кузова после ДТП',
    price: 'от 10 000 ₽',
    duration: 'от 1 дня',
    icon: 'Car'
  }
];

interface ServiceSelectorProps {
  selectedServices: number[];
  selectedPromotion: string;
  promotions: Promotion[];
  loadingPromotions: boolean;
  onToggleService: (id: number) => void;
  onPromotionChange: (value: string) => void;
}

const ServiceSelector = ({
  selectedServices,
  selectedPromotion,
  promotions,
  loadingPromotions,
  onToggleService,
  onPromotionChange
}: ServiceSelectorProps) => {
  const calculateTotal = () => {
    const basePrices: { [key: number]: number } = {
      1: 3500,
      2: 1500,
      3: 1200,
      4: 2000,
      5: 5000,
      6: 10000
    };
    return selectedServices.reduce((sum, id) => sum + basePrices[id], 0);
  };

  return (
    <>
      {!loadingPromotions && promotions.length > 0 && (
        <div className="space-y-3">
          <Label>Акция (необязательно)</Label>
          <Select value={selectedPromotion} onValueChange={onPromotionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите акцию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Без акции</SelectItem>
              {promotions.map(promo => (
                <SelectItem key={promo.id} value={promo.title}>
                  {promo.title} ({promo.discount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-4">
        <Label>Выберите услуги</Label>
        <div className="grid grid-cols-1 gap-3">
          {services.map(service => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all ${
                selectedServices.includes(service.id)
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onToggleService(service.id)}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{service.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">{service.description}</CardDescription>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">{service.duration}</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    selectedServices.includes(service.id)
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`}>
                    {selectedServices.includes(service.id) && (
                      <Icon name="Check" size={16} className="text-white" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {selectedServices.length > 0 && (
        <div className="bg-primary/10 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Точная стоимость будет рассчитана после указания марки и модели автомобиля</p>
        </div>
      )}
    </>
  );
};

export default ServiceSelector;