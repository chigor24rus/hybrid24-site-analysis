-- Таблица для маппинга linkedid на оригинальные имена файлов из Asterisk
CREATE TABLE IF NOT EXISTS call_recordings_mapping (
    id SERIAL PRIMARY KEY,
    linkedid VARCHAR(255) UNIQUE NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    channel VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    call_start TIMESTAMP,
    call_end TIMESTAMP
);

-- Индекс для быстрого поиска по linkedid
CREATE INDEX IF NOT EXISTS idx_linkedid ON call_recordings_mapping(linkedid);

-- Индекс для поиска по дате создания
CREATE INDEX IF NOT EXISTS idx_created_at ON call_recordings_mapping(created_at);

COMMENT ON TABLE call_recordings_mapping IS 'Маппинг linkedid звонков на оригинальные имена файлов записей из Asterisk AMI';
COMMENT ON COLUMN call_recordings_mapping.linkedid IS 'Уникальный ID звонка из Asterisk (например, 1768317461.322921)';
COMMENT ON COLUMN call_recordings_mapping.original_filename IS 'Оригинальное имя файла записи (например, SIP-109-0000b645-2026-01-13-22-17-41.wav)';