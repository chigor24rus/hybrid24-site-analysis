export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface Model {
  id: number;
  brand_id: number;
  name: string;
  year_range?: string;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  oldPrice: string;
  newPrice: string;
  validUntil: string;
  icon: string;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  brand: string;
  model: string;
  plateNumber: string;
  vin: string;
  comment: string;
}

export interface BookingDialogProps {
  setIsBookingOpen: (open: boolean) => void;
  initialSelectedServices?: number[];
  initialBrandId?: number;
}
