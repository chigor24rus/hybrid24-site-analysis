-- Добавление уникального индекса на brand_id + name для предотвращения дубликатов
CREATE UNIQUE INDEX IF NOT EXISTS car_models_brand_name_unique 
ON car_models (brand_id, name);