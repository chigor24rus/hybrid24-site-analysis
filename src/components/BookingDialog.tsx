import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import ServiceSelector from './booking/ServiceSelector';
import DateTimeSelector from './booking/DateTimeSelector';
import ContactForm from './booking/ContactForm';
import { useBookingData } from './booking/useBookingData';
import { useBookingSubmit } from './booking/useBookingSubmit';
import type { BookingDialogProps, BookingFormData } from './booking/types';

const INITIAL_FORM_DATA: BookingFormData = {
  name: '',
  phone: '',
  email: '',
  brand: '',
  model: '',
  plateNumber: '',
  vin: '',
  comment: '',
};

const BookingDialog = ({ 
  setIsBookingOpen, 
  initialSelectedServices = [], 
  initialBrandId,
  initialPromotion = ''
}: BookingDialogProps) => {
  const [selectedServices, setSelectedServices] = useState<number[]>(initialSelectedServices);

  useEffect(() => {
    if (initialSelectedServices.length > 0) {
      setSelectedServices(initialSelectedServices);
    }
  }, [initialSelectedServices]);
  const [selectedPromotion, setSelectedPromotion] = useState<string>(initialPromotion);

  useEffect(() => {
    setSelectedPromotion(initialPromotion);
  }, [initialPromotion]);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_FORM_DATA);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    brands,
    models,
    promotions,
    loadingBrands,
    loadingPromotions,
    selectedBrand,
    setSelectedBrand,
  } = useBookingData(initialBrandId);

  const { isSubmitting, submitSuccess, handleSubmit } = useBookingSubmit({
    selectedServices,
    selectedPromotion,
    date,
    time,
    formData: { ...formData, brand: selectedBrand },
    brands,
    models,
    setIsBookingOpen,
  });

  const toggleService = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const updateFormField = <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    updateFormField('model', '');
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
            Мы свяжемся с вами в ближайшее время для подтверждения записи
          </DialogDescription>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Онлайн-запись</DialogTitle>
        <DialogDescription>
          Выберите услуги, желаемую дату и время визита
        </DialogDescription>
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
          name={formData.name}
          phone={formData.phone}
          email={formData.email}
          brand={selectedBrand}
          model={formData.model}
          plateNumber={formData.plateNumber}
          vin={formData.vin}
          comment={formData.comment}
          brands={brands}
          models={models}
          loadingBrands={loadingBrands}
          agreedToTerms={agreedToTerms}
          onNameChange={(value) => updateFormField('name', value)}
          onPhoneChange={(value) => updateFormField('phone', value)}
          onEmailChange={(value) => updateFormField('email', value)}
          onBrandChange={handleBrandChange}
          onModelChange={(value) => updateFormField('model', value)}
          onPlateNumberChange={(value) => updateFormField('plateNumber', value)}
          onVinChange={(value) => updateFormField('vin', value)}
          onCommentChange={(value) => updateFormField('comment', value)}
          onAgreedToTermsChange={setAgreedToTerms}
        />

        <Button
          onClick={handleSubmit}
          disabled={!formData.name || !formData.phone || !agreedToTerms || isSubmitting}
          className="w-full gradient-primary"
        >
          {isSubmitting ? (
            <>
              <Icon name="Loader" className="mr-2 animate-spin" size={20} />
              Отправка...
            </>
          ) : (
            <>
              <Icon name="Calendar" className="mr-2" size={20} />
              Записаться на сервис
            </>
          )}
        </Button>
      </div>
    </DialogContent>
  );
};

export default BookingDialog;