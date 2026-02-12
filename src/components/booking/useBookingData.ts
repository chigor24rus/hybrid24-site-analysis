import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/utils/apiClient';
import type { Brand, Model, Promotion } from './types';

export const useBookingData = (initialBrandId?: number) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('');

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.brands.list);
        const data = await response.json();
        setBrands(data.brands || []);
        
        if (initialBrandId) {
          setSelectedBrand(initialBrandId.toString());
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
        const response = await fetch(`${API_ENDPOINTS.promotions.list}?t=${timestamp}`);
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
      if (!selectedBrand) {
        setModels([]);
        return;
      }
      
      try {
        const response = await fetch(`${API_ENDPOINTS.models.api}?brand_id=${selectedBrand}`);
        const data = await response.json();
        setModels(data.models || []);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    
    fetchModels();
  }, [selectedBrand]);

  return {
    brands,
    models,
    promotions,
    loadingBrands,
    loadingPromotions,
    selectedBrand,
    setSelectedBrand,
  };
};
