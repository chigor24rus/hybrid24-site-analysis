export interface Brand {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  brand_id: number;
  brand_name: string;
  name: string;
  year_from: number | null;
  year_to: number | null;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
}

export interface PriceForm {
  id: number;
  brand_id: string;
  model_id: string;
  service_id: string;
  price: string;
}

export interface Price {
  id: number;
  brand_id: number;
  model_id: number | null;
  service_id: number;
  price: string;
}

export interface PriceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  priceForm: PriceForm;
  setPriceForm: (form: PriceForm) => void;
  brands: Brand[];
  models: Model[];
  services: Service[];
  prices: Price[];
  onSave: () => Promise<void>;
  onRefresh: () => Promise<void>;
}
