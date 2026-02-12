-- Удаляем старый foreign key на models
ALTER TABLE t_p13334878_hybrid24_site_analys.service_prices 
DROP CONSTRAINT IF EXISTS service_prices_model_id_fkey;

-- Создаём правильный foreign key на car_models
ALTER TABLE t_p13334878_hybrid24_site_analys.service_prices 
ADD CONSTRAINT service_prices_model_id_fkey 
FOREIGN KEY (model_id) REFERENCES t_p13334878_hybrid24_site_analys.car_models(id);
