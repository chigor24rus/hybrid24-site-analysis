-- Удаляем UNIQUE индекс — он вызывает ошибку прав доступа
DROP INDEX IF EXISTS car_models_brand_name_unique;