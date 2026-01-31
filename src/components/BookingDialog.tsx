import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import ServiceSelector, { services } from './booking/ServiceSelector';
import DateTimeSelector from './booking/DateTimeSelector';
import ContactForm from './booking/ContactForm';

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

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  oldPrice: string;
  newPrice: string;
  validUntil: string;
  icon: string;
}

interface BookingDialogProps {
  setIsBookingOpen: (open: boolean) => void;
  initialSelectedServices?: number[];
  initialBrandId?: number;
}

const BookingDialog = ({ setIsBookingOpen, initialSelectedServices = [], initialBrandId }: BookingDialogProps) => {
  const [selectedServices, setSelectedServices] = useState<number[]>(initialSelectedServices);
  const [selectedPromotion, setSelectedPromotion] = useState<string>('');
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
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingPromotions, setLoadingPromotions] = useState(true);

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

    const fetchPromotions = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`https://functions.poehali.dev/f1aecbb9-bab7-4235-a31d-88082b99927d?t=${timestamp}`, {
          cache: 'no-store'
        });
        const data = await response.json();
        setPromotions(data.promotions || []);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoadingPromotions(false);
      }
    };

    fetchBrands();
    fetchPromotions();
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

      const selectedPromotionData = promotions.find(p => p.id.toString() === selectedPromotion);

      const bookingData = {
        name,
        phone,
        email,
        service: selectedServiceTitles || 'Не указано',
        promotion: selectedPromotionData?.title || '',
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
        
        const notificationData = {
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          service_type: selectedServiceTitles || 'Не указано',
          promotion: selectedPromotionData?.title || '',
          car_brand: selectedBrand?.name || '',
          car_model: selectedModel?.name || '',
          preferred_date: date ? format(date, 'dd.MM.yyyy') : '',
          preferred_time: time,
          comment,
        };
        
        fetch('https://functions.poehali.dev/8b118617-cafd-4196-b36d-7a784ab13dc6', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData),
        }).catch(err => console.warn('Email notification failed:', err));
        
        fetch('https://functions.poehali.dev/d5431aca-bf68-41c1-b31f-e7bfa56a1f4b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData),
        }).catch(err => console.warn('Telegram notification failed:', err));
        
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
        <ServiceSelector
          selectedServices={selectedServices}
          selectedPromotion={selectedPromotion}
          promotions={promotions}
          loadingPromotions={loadingPromotions}
          onToggleService={toggleService}
          onPromotionChange={setSelectedPromotion}
        />

        <DateTimeSelector
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />

        <ContactForm
          name={name}
          phone={phone}
          email={email}
          brand={brand}
          model={model}
          comment={comment}
          brands={brands}
          models={models}
          loadingBrands={loadingBrands}
          agreedToTerms={agreedToTerms}
          onNameChange={setName}
          onPhoneChange={setPhone}
          onEmailChange={setEmail}
          onBrandChange={setBrand}
          onModelChange={setModel}
          onCommentChange={setComment}
          onAgreedToTermsChange={setAgreedToTerms}
        />

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