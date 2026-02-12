import { useState, useMemo } from 'react';
import type { Brand, Model, Service, Price } from './PriceDialogTypes';

export const usePriceDialogLogic = (
  brands: Brand[],
  models: Model[],
  services: Service[],
  prices: Price[],
  onOpenChange: (open: boolean) => void,
  onRefresh: () => Promise<void>
) => {
  const [searchBrand, setSearchBrand] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [searchService, setSearchService] = useState('');
  const [onlyNoPrices, setOnlyNoPrices] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicePrices, setServicePrices] = useState<Record<string, string>>({});
  const [bulkMode, setBulkMode] = useState(false);

  const priceMap = useMemo(() => {
    const map = new Map<string, Price>();
    prices.forEach(p => {
      const key = `${p.brand_id}-${p.model_id || 'null'}-${p.service_id}`;
      map.set(key, p);
    });
    return map;
  }, [prices]);

  const priceSet = useMemo(() => {
    return new Set(
      prices.map(p => `${p.brand_id}-${p.model_id || 'null'}-${p.service_id}`)
    );
  }, [prices]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSearchBrand('');
      setSearchModel('');
      setSearchService('');
      setOnlyNoPrices(false);
      setSelectedBrands([]);
      setSelectedModels([]);
      setSelectedServices([]);
      setServicePrices({});
      setBulkMode(false);
    }
  };

  const hasPrice = (brandId: string, modelId: string, serviceId: string) => {
    const key = `${brandId}-${modelId || 'null'}-${serviceId}`;
    return priceSet.has(key);
  };

  const filteredBrands = brands.filter(brand => {
    if (!onlyNoPrices) return brand.name.toLowerCase().includes(searchBrand.toLowerCase());
    const matchesSearch = brand.name.toLowerCase().includes(searchBrand.toLowerCase());
    
    const servicesToCheck = selectedServices.length > 0 
      ? services.filter(s => selectedServices.includes(s.id.toString()))
      : services;
    
    const hasNoPriceForSelectedServices = servicesToCheck.some(service => 
      !hasPrice(brand.id.toString(), '', service.id.toString())
    );
    return matchesSearch && hasNoPriceForSelectedServices;
  });

  const filteredModels = useMemo(() => {
    if (selectedBrands.length === 0) return [];
    return models.filter(model => {
      const matchesBrand = selectedBrands.includes(model.brand_id.toString());
      const matchesSearch = model.name.toLowerCase().includes(searchModel.toLowerCase());
      return matchesBrand && matchesSearch;
    });
  }, [models, selectedBrands, searchModel]);

  const filteredServices = services.filter(service => {
    if (!onlyNoPrices) return service.title.toLowerCase().includes(searchService.toLowerCase());
    const matchesSearch = service.title.toLowerCase().includes(searchService.toLowerCase());
    
    const brandsToCheck = selectedBrands.length > 0
      ? brands.filter(b => selectedBrands.includes(b.id.toString()))
      : brands;
    
    const hasNoPriceForSelectedBrands = brandsToCheck.some(brand =>
      !hasPrice(brand.id.toString(), '', service.id.toString())
    );
    return matchesSearch && hasNoPriceForSelectedBrands;
  });

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev => {
      if (prev.includes(brandId)) {
        // При снятии бренда - убираем и все его модели
        const relatedModelIds = models
          .filter(m => m.brand_id.toString() === brandId)
          .map(m => m.id.toString());
        setSelectedModels(prevModels => 
          prevModels.filter(id => !relatedModelIds.includes(id))
        );
        return prev.filter(id => id !== brandId);
      }
      
      if (onlyNoPrices && prev.length >= 10) {
        alert('Максимум 10 брендов при фильтре "Только без цен"');
        return prev;
      }
      
      return [...prev, brandId];
    });
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newServices = prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      
      if (prev.includes(serviceId)) {
        const newPrices = { ...servicePrices };
        delete newPrices[serviceId];
        setServicePrices(newPrices);
      }
      
      return newServices;
    });
  };

  const updateServicePrice = (serviceId: string, price: string) => {
    setServicePrices(prev => ({
      ...prev,
      [serviceId]: price
    }));
  };

  const handleBulkSave = async () => {
    if (selectedBrands.length === 0 || selectedServices.length === 0) {
      alert('Выберите хотя бы один бренд и одну услугу');
      return;
    }

    const missingPrices = selectedServices.filter(serviceId => !servicePrices[serviceId]?.trim());
    if (missingPrices.length > 0) {
      alert('Укажите цены для всех выбранных услуг');
      return;
    }

    try {
      const combinations: Array<{ brandId: string; modelId: string | null; serviceId: string; existingId?: number; isUpdate: boolean }> = [];
      
      // Если модели выбраны - создаём цены для конкретных моделей
      // Если моделей нет - создаём для всех моделей бренда (model_id = null)
      for (const brandId of selectedBrands) {
        const modelsToUse = selectedModels.length > 0 
          ? selectedModels.filter(modelId => {
              const model = models.find(m => m.id.toString() === modelId);
              return model?.brand_id.toString() === brandId;
            })
          : [null]; // null = для всех моделей бренда
        
        for (const modelId of modelsToUse) {
          for (const serviceId of selectedServices) {
            const key = `${brandId}-${modelId || 'null'}-${serviceId}`;
            const existingPrice = priceMap.get(key);
            
            if (!existingPrice) {
              combinations.push({ brandId, modelId, serviceId, isUpdate: false });
            } else {
              // Разрешаем обновление любых существующих цен
              combinations.push({ brandId, modelId, serviceId, existingId: existingPrice.id, isUpdate: true });
            }
          }
        }
      }

      if (combinations.length === 0) {
        alert('Не удалось найти комбинации для сохранения');
        return;
      }

      const newCount = combinations.filter(c => !c.isUpdate).length;
      const updateCount = combinations.filter(c => c.isUpdate).length;
      
      let confirmMessage = '';
      if (newCount > 0) confirmMessage += `Создано новых: ${newCount}\n`;
      if (updateCount > 0) confirmMessage += `Обновлено существующих: ${updateCount}\n`;
      confirmMessage += '\nПродолжить?';
      
      if (!confirm(confirmMessage)) return;

      const fetchWithRetry = async (combo: { brandId: string; modelId: string | null; serviceId: string; existingId?: number; isUpdate: boolean }, retries = 2) => {
        const priceValue = servicePrices[combo.serviceId];
        const numericPrice = parseFloat(priceValue.replace(/[^\d.]/g, ''));
        
        const requestBody = combo.isUpdate ? {
          id: combo.existingId,
          base_price: numericPrice,
        } : {
          brand_id: parseInt(combo.brandId),
          model_id: combo.modelId ? parseInt(combo.modelId) : null,
          service_id: parseInt(combo.serviceId),
          base_price: numericPrice,
          currency: '₽',
        };
        
        console.log(`Sending ${combo.isUpdate ? 'PUT' : 'POST'} request:`, requestBody);
        
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            // Добавляем timestamp чтобы обойти кэш Cloud Functions
            const url = `https://functions.poehali.dev/6a166b57-f740-436b-8d48-f1c3b32f0791?_t=${Date.now()}`;
            const res = await fetch(url, {
              method: combo.isUpdate ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            });

            if (res.ok) {
              return { success: true };
            }

            // 409 = цена уже существует, это ОК для обновления
            if (res.status === 409 && combo.isUpdate) {
              return { success: true };
            }

            // Логируем ошибку
            const errorText = await res.text().catch(() => 'Unknown error');
            console.error(`HTTP ${res.status}:`, errorText);

            if (res.status === 500 && attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
              continue;
            }

            return { success: false, status: res.status };
          } catch (error) {
            console.error('Request error:', error);
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
              continue;
            }
            return { success: false };
          }
        }
        return { success: false };
      };

      const batchSize = 10;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < combinations.length; i += batchSize) {
        const batch = combinations.slice(i, i + batchSize);
        
        const batchPromises = batch.map((combo) => 
          fetchWithRetry(combo).then(result => {
            if (result.success) {
              successCount++;
            } else {
              errorCount++;
            }
            return result;
          })
        );

        await Promise.all(batchPromises);
      }

      await onRefresh();
      handleOpenChange(false);
      
      if (errorCount > 0) {
        alert(`Создано цен: ${successCount}\nОшибок: ${errorCount}\n\nНекоторые цены не удалось сохранить.`);
      } else {
        alert(`Успешно создано ${successCount} цен!`);
      }
    } catch (error) {
      console.error('Error bulk saving prices:', error);
      alert('Ошибка при сохранении цен');
    }
  };

  return {
    searchBrand,
    setSearchBrand,
    searchModel,
    setSearchModel,
    searchService,
    setSearchService,
    onlyNoPrices,
    setOnlyNoPrices,
    selectedBrands,
    selectedModels,
    selectedServices,
    servicePrices,
    bulkMode,
    setBulkMode,
    filteredBrands,
    filteredModels,
    filteredServices,
    toggleBrand,
    toggleModel,
    toggleService,
    updateServicePrice,
    handleBulkSave,
    handleOpenChange,
    setSelectedBrands,
    setSelectedModels,
    setSelectedServices,
    setServicePrices,
  };
};