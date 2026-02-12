export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
}

export interface Service {
  id: number;
  title: string;
}

export interface Price {
  id: number;
  service_id: number;
  brand_id: number;
  base_price: number;
  currency: string;
  service_title: string;
  brand_name: string;
}

export interface ModelTag {
  id: number;
  name: string;
  color: string;
}

export interface Model {
  id: number;
  brand_id: number;
  name: string;
  year_from?: number;
  year_to?: number;
  brand_name?: string;
  tags?: ModelTag[];
}