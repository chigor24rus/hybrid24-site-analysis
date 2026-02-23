import { useState, useRef, useCallback } from 'react';
import { API_ENDPOINTS } from '@/utils/apiClient';

export interface ClientFromCrm {
  found: boolean;
  kontragent_key?: string;
  name?: string;
  email?: string;
  car?: {
    vin?: string;
    plate_number?: string;
    avtomobil_key?: string;
    car_full_name?: string;
    car_brand?: string;
    car_model?: string;
    god_vypuska?: string;
  };
}

export const useClientLookup = () => {
  const [lookupLoading, setLookupLoading] = useState(false);
  const [clientData, setClientData] = useState<ClientFromCrm | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lookup = useCallback(async (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setClientData(null);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const res = await fetch(`${API_ENDPOINTS.client.lookup}?phone=${encodeURIComponent(phone)}`);
        const data: ClientFromCrm = await res.json();
        setClientData(data.found ? data : null);
      } catch {
        setClientData(null);
      } finally {
        setLookupLoading(false);
      }
    }, 800);
  }, []);

  return { lookup, lookupLoading, clientData, setClientData };
};
