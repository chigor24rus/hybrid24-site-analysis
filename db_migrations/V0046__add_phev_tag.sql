-- Добавление тега PHEV
INSERT INTO model_tags (name, description, color) 
VALUES ('PHEV', 'Подключаемый гибрид (Plug-in Hybrid)', '#ec4899')
ON CONFLICT (name) DO NOTHING;