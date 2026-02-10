-- Добавляем поле call_date для хранения даты звонка из ZEON
ALTER TABLE zeon_recordings_sync 
ADD COLUMN IF NOT EXISTS call_date TIMESTAMP;

-- Обновляем существующие записи: извлекаем дату из названия файла
UPDATE zeon_recordings_sync 
SET call_date = TO_TIMESTAMP(
    SUBSTRING(file_name FROM 1 FOR 15), 
    'YYYYMMDD_HH24MISS'
)
WHERE call_date IS NULL AND file_name ~ '^[0-9]{8}_[0-9]{6}';