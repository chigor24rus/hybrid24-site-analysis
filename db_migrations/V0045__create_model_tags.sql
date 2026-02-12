-- Создаем таблицу тегов
CREATE TABLE IF NOT EXISTS model_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу связи моделей и тегов
CREATE TABLE IF NOT EXISTS car_model_tags (
    model_id INTEGER NOT NULL REFERENCES car_models(id),
    tag_id INTEGER NOT NULL REFERENCES model_tags(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (model_id, tag_id)
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_car_model_tags_model_id ON car_model_tags(model_id);
CREATE INDEX IF NOT EXISTS idx_car_model_tags_tag_id ON car_model_tags(tag_id);

-- Добавляем начальные теги
INSERT INTO model_tags (name, description, color) VALUES
    ('Электромобиль', 'Полностью электрический автомобиль', '#10b981'),
    ('Гибрид', 'Гибридный автомобиль (бензин + электро)', '#f59e0b'),
    ('Бензин', 'Бензиновый двигатель', '#3b82f6'),
    ('Дизель', 'Дизельный двигатель', '#6366f1'),
    ('Премиум', 'Премиум сегмент', '#8b5cf6'),
    ('Внедорожник', 'Внедорожник / SUV', '#ef4444')
ON CONFLICT (name) DO NOTHING;