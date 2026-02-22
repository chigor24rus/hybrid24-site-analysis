import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import TestResultBlock, { TestResult } from './TestResultBlock';

export interface OrderData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_type: string;
  car_brand: string;
  car_model: string;
  preferred_date: string;
  preferred_time: string;
  comment: string;
}

interface CreateOrderCardProps {
  loading: boolean;
  orderResult: TestResult | null;
  testOrderData: OrderData;
  onOrderDataChange: (data: OrderData) => void;
  onCreateOrder: () => void;
}

const CreateOrderCard = ({
  loading,
  orderResult,
  testOrderData,
  onOrderDataChange,
  onCreateOrder,
}: CreateOrderCardProps) => {
  const update = (field: keyof OrderData, value: string) => {
    onOrderDataChange({ ...testOrderData, [field]: value });
  };

  return (
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
                onChange={(e) => update('customer_name', e.target.value)}
              />
            </div>
            <div>
              <Label>Телефон</Label>
              <Input
                value={testOrderData.customer_phone}
                onChange={(e) => update('customer_phone', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={testOrderData.customer_email}
                onChange={(e) => update('customer_email', e.target.value)}
              />
            </div>
            <div>
              <Label>Услуга</Label>
              <Input
                value={testOrderData.service_type}
                onChange={(e) => update('service_type', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Марка авто</Label>
              <Input
                value={testOrderData.car_brand}
                onChange={(e) => update('car_brand', e.target.value)}
              />
            </div>
            <div>
              <Label>Модель авто</Label>
              <Input
                value={testOrderData.car_model}
                onChange={(e) => update('car_model', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Дата</Label>
              <Input
                type="date"
                value={testOrderData.preferred_date}
                onChange={(e) => update('preferred_date', e.target.value)}
              />
            </div>
            <div>
              <Label>Время</Label>
              <Input
                type="time"
                value={testOrderData.preferred_time}
                onChange={(e) => update('preferred_time', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Комментарий</Label>
            <Textarea
              value={testOrderData.comment}
              onChange={(e) => update('comment', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <Button onClick={onCreateOrder} disabled={loading} className="w-full">
          {loading ? <Icon name="Loader" className="mr-2 animate-spin" size={18} /> : <Icon name="Send" className="mr-2" size={18} />}
          Создать тестовый заказ
        </Button>
        <TestResultBlock result={orderResult} />
      </CardContent>
    </Card>
  );
};

export default CreateOrderCard;
