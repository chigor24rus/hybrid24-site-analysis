import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';

interface FreeDiagnosticsDialogProps {
  setIsOpen: (open: boolean) => void;
}

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  brand_id: number;
  name: string;
}

const FreeDiagnosticsDialog = ({ setIsOpen }: FreeDiagnosticsDialogProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vin, setVin] = useState('');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: brands = [], isLoading: loadingBrands } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f');
      if (!response.ok) throw new Error('Failed to fetch brands');
      const data = await response.json();
      return data.brands || [];
    }
  });

  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch('https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models || [];
    }
  });

  const filteredModels = brand ? models.filter(m => m.brand_id === parseInt(brand)) : [];
  const selectedBrandName = brands.find(b => b.id === parseInt(brand))?.name || '';
  const selectedModelName = filteredModels.find(m => m.id === parseInt(model))?.name || '';

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handleSubmit = async () => {
    if (!name || !phone || !agreedToTerms) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля и согласитесь с условиями',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        name,
        phone,
        email,
        brand: selectedBrandName,
        model: selectedModelName,
        plateNumber,
        vin,
        comment,
        services: [],
        promotion: 'Бесплатная диагностика по 100+ пунктам',
        date: date ? format(date, 'yyyy-MM-dd', { locale: ru }) : '',
        time: time || ''
      };

      const response = await fetch('https://functions.poehali.dev/a6d5798a-4b6c-4b15-8fd8-0264c1c51660', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) throw new Error('Failed to submit booking');

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку. Попробуйте позже.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <DialogContent className="max-w-md">
        <div className="text-center py-8">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <Icon name="CheckCircle" size={48} className="text-green-600" />
            </div>
          </div>
          <DialogTitle className="mb-2">Заявка отправлена!</DialogTitle>
          <DialogDescription>
            Мы свяжемся с вами в ближайшее время для подтверждения записи на бесплатную диагностику
          </DialogDescription>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Бесплатная диагностика по 100+ пунктам</DialogTitle>
        <DialogDescription>
          Для новых клиентов при общей стоимости заказ-наряда от 5 000 ₽
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="bg-primary/10 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Icon name="CheckCircle2" size={16} className="text-primary" />
            <span>Общий технический осмотр</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Icon name="CheckCircle2" size={16} className="text-primary" />
            <span>Диагностика ходовой части</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Icon name="CheckCircle2" size={16} className="text-primary" />
            <span>Проверка по 100+ пунктам</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Дата визита</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Icon name="Calendar" className="mr-2" size={16} />
                    {date ? format(date, 'PP', { locale: ru }) : 'Выберите дату'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Время</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ваше имя *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (900) 000-00-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Марка авто</Label>
              <Select value={brand} onValueChange={(value) => { setBrand(value); setModel(''); }}>
                <SelectTrigger id="brand">
                  <SelectValue placeholder={loadingBrands ? "Загрузка..." : "Выберите марку"} />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Модель</Label>
              <Select value={model} onValueChange={setModel} disabled={!brand}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Выберите модель" />
                </SelectTrigger>
                <SelectContent>
                  {filteredModels.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plateNumber">Гос. номер</Label>
              <Input
                id="plateNumber"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="А123ВС 199"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="XWXXXXXXXXXX00000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Дополнительная информация"
              rows={3}
            />
          </div>

          <div className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
            agreedToTerms ? 'bg-muted/30 border-border' : 'bg-destructive/5 border-destructive/30'
          }`}>
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 min-w-[20px] accent-primary cursor-pointer"
              required
              aria-required="true"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer select-none">
              Я согласен с условиями записи и даю согласие на обработку персональных данных <span className="text-destructive">*</span>. Понимаю, что запись будет подтверждена обратным звонком мастера-консультанта.
            </label>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!name || !phone || !agreedToTerms || isSubmitting}
          className="w-full gradient-primary"
        >
          {isSubmitting ? (
            <>
              <Icon name="Loader" className="mr-2 animate-spin" size={20} />
              Отправка...
            </>
          ) : (
            <>
              <Icon name="Gift" className="mr-2" size={20} />
              Записаться на бесплатную диагностику
            </>
          )}
        </Button>
      </div>
    </DialogContent>
  );
};

export default FreeDiagnosticsDialog;