import { useState } from 'react';
import { format } from 'date-fns';
import { API_ENDPOINTS } from '@/utils/apiClient';
import { services } from './ServiceSelector';
import { BOOKING_CONSTANTS } from './constants';
import type { Brand, Model, BookingFormData } from './types';

interface UseBookingSubmitParams {
  selectedServices: number[];
  selectedPromotion: string;
  date?: Date;
  time: string;
  formData: BookingFormData;
  brands: Brand[];
  models: Model[];
  setIsBookingOpen: (open: boolean) => void;
}

export const useBookingSubmit = ({
  selectedServices,
  selectedPromotion,
  date,
  time,
  formData,
  brands,
  models,
  setIsBookingOpen,
}: UseBookingSubmitParams) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const prepareBookingData = () => {
    const selectedServiceTitles = selectedServices
      .map(id => services.find(s => s.id === id)?.title)
      .filter(Boolean)
      .join(', ');

    const selectedBrand = brands.find(b => b.id.toString() === formData.brand);
    const selectedModel = models.find(m => m.id.toString() === formData.model);
    return {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      service: selectedServiceTitles || BOOKING_CONSTANTS.PLACEHOLDER_VALUE,
      promotion: selectedPromotion === 'none' ? '' : selectedPromotion,
      brand: selectedBrand?.name || '',
      model: selectedModel?.name || '',
      date: date ? format(date, 'yyyy-MM-dd') : '',
      time,
      comment: formData.comment,
    };
  };

  const prepareNotificationData = (bookingData: ReturnType<typeof prepareBookingData>) => ({
    customer_name: bookingData.name,
    customer_phone: bookingData.phone,
    customer_email: bookingData.email,
    service_type: bookingData.service,
    promotion: bookingData.promotion,
    car_brand: bookingData.brand,
    car_model: bookingData.model,
    plate_number: formData.plateNumber,
    vin: formData.vin,
    preferred_date: date ? format(date, 'dd.MM.yyyy') : '',
    preferred_time: time,
    comment: formData.comment,
  });

  const sendNotifications = async (notificationData: ReturnType<typeof prepareNotificationData>) => {
    const notificationEndpoints = [
      API_ENDPOINTS.email.sendBooking,
      API_ENDPOINTS.telegram.send,
      API_ENDPOINTS.max.send,
    ];

    await Promise.allSettled(
      notificationEndpoints.map(endpoint =>
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData),
        })
      )
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = prepareBookingData();

      const response = await fetch(API_ENDPOINTS.bookings.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        
        const notificationData = prepareNotificationData(bookingData);
        await sendNotifications(notificationData);
        
        setTimeout(() => {
          setIsBookingOpen(false);
        }, BOOKING_CONSTANTS.SUCCESS_REDIRECT_DELAY);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitSuccess,
    handleSubmit,
  };
};