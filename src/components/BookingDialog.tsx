import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Model {
  id: number;
  brand_id: number;
  name: string;
  year_range?: string;
}

const services = [
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

interface BookingDialogProps {
  setIsBookingOpen: (open: boolean) => void;
  initialSelectedServices?: number[];
  initialBrandId?: number;
}

const BookingDialog = ({ setIsBookingOpen, initialSelectedServices = [], initialBrandId }: BookingDialogProps) => {
  const [selectedServices, setSelectedServices] = useState<number[]>(initialSelectedServices);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f');
        const data = await response.json();
        setBrands(data.brands || []);
        
        if (initialBrandId) {
          setBrand(initialBrandId.toString());
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, [initialBrandId]);

  useEffect(() => {
    const fetchModels = async () => {
      if (!brand) {
        setModels([]);
        setModel('');
        return;
      }
      try {
        const response = await fetch(`https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b?brand_id=${brand}`);
        const data = await response.json();
        setModels(data.models || []);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    fetchModels();
  }, [brand]);

  const toggleService = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

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

  const handleBooking = async () => {
    if (!name || !phone) {
      alert('Пожалуйста, укажите ваше имя и телефон');
      return;
    }

    if (!agreedToTerms) {
      alert('Пожалуйста, подтвердите согласие с условиями записи');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedServiceTitles = selectedServices
        .map(id => services.find(s => s.id === id)?.title)
        .filter(Boolean)
        .join(', ');

      const selectedBrand = brands.find(b => b.id.toString() === brand);
      const selectedModel = models.find(m => m.id.toString() === model);

      const bookingData = {
        name,
        phone,
        email,
        service: selectedServiceTitles || 'Не указано',
        brand: selectedBrand?.name || '',
        model: selectedModel?.name || '',
        date: date ? format(date, 'yyyy-MM-dd') : '',
        time,
        comment,
      };

      const response = await fetch('https://functions.poehali.dev/55c039ba-f940-49e1-8589-73ace0f01f05', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        
        fetch('https://functions.poehali.dev/8b118617-cafd-4196-b36d-7a784ab13dc6', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: name,
            customer_phone: phone,
            customer_email: email,
            service_type: selectedServiceTitles || 'Не указано',
            car_brand: selectedBrand?.name || '',
            car_model: selectedModel?.name || '',
            preferred_date: date ? format(date, 'dd.MM.yyyy') : '',
            preferred_time: time,
            comment,
          }),
        }).catch(err => console.warn('Email notification failed:', err));
        
        setTimeout(() => {
          setIsBookingOpen(false);
        }, 2000);
      } else {
        alert(data.error || 'Ошибка при отправке заявки. Попробуйте позже.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Ошибка при отправке заявки. Проверьте соединение и попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Онлайн-запись</DialogTitle>
        <DialogDescription>Выберите услуги, желаемую дату и время визита</DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
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
                onClick={() => toggleService(service.id)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{service.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">{service.description}</CardDescription>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-primary font-semibold">{service.price}</span>
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
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Предварительная стоимость:</span>
              <span className="text-2xl font-bold text-primary">{calculateTotal().toLocaleString()} ₽</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Желаемая дата визита</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Icon name="Calendar" className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ru}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Желаемое время визита</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите время" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">09:00</SelectItem>
                <SelectItem value="10:00">10:00</SelectItem>
                <SelectItem value="11:00">11:00</SelectItem>
                <SelectItem value="12:00">12:00</SelectItem>
                <SelectItem value="13:00">13:00</SelectItem>
                <SelectItem value="14:00">14:00</SelectItem>
                <SelectItem value="15:00">15:00</SelectItem>
                <SelectItem value="16:00">16:00</SelectItem>
                <SelectItem value="17:00">17:00</SelectItem>
                <SelectItem value="18:00">18:00</SelectItem>
                <SelectItem value="19:00">19:00</SelectItem>
                <SelectItem value="20:00">20:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
            <span>Дата и время записи резервируется только после подтверждения записи обратным звонком мастера-консультанта</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Ваше имя</Label>
          <Input
            id="name"
            placeholder="Иван Иванов"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="ivan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Марка авто</Label>
            <Select value={brand} onValueChange={setBrand} disabled={loadingBrands}>
              <SelectTrigger>
                <SelectValue placeholder={loadingBrands ? "Загрузка..." : "Выберите бренд"} />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Модель</Label>
            <Select value={model} onValueChange={setModel} disabled={!brand || models.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={!brand ? "Сначала выберите бренд" : models.length === 0 ? "Нет моделей" : "Выберите модель"} />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.name} {m.year_range && `(${m.year_range})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Комментарий (необязательно)</Label>
          <Textarea
            id="comment"
            placeholder="Дополнительная информация..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 accent-primary cursor-pointer"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
            Я согласен с условиями записи и даю согласие на обработку персональных данных. Понимаю, что запись будет подтверждена обратным звонком мастера-консультанта.
          </label>
        </div>

        {submitSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <Icon name="CheckCircle" className="mx-auto mb-2 text-green-600" size={32} />
            <p className="text-green-800 font-semibold">Заявка успешно отправлена!</p>
            <p className="text-green-600 text-sm mt-1">Мы свяжемся с вами в ближайшее время</p>
          </div>
        ) : (
          <Button
            className="w-full gradient-primary btn-glow"
            size="lg"
            onClick={handleBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader" className="mr-2 animate-spin" size={20} />
                Отправка...
              </>
            ) : (
              <>
                Отправить заявку
                <Icon name="Send" className="ml-2" size={20} />
              </>
            )}
          </Button>
        )}
      </div>
    </DialogContent>
  );
};

export default BookingDialog;