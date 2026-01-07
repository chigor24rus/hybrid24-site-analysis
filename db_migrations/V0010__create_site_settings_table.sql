-- Таблица для хранения настроек сайта
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем начальные настройки
INSERT INTO site_settings (setting_key, setting_value) 
VALUES 
    ('maintenance_mode', 'false'),
    ('maintenance_end_time', '')
ON CONFLICT (setting_key) DO NOTHING;

-- Индекс для быстрого поиска по ключу
CREATE INDEX IF NOT EXISTS idx_setting_key ON site_settings(setting_key);