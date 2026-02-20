-- Добавляем услугу: Зарядка высоковольтных батарей
INSERT INTO t_p13334878_hybrid24_site_analys.services (title, description, icon, duration, is_active)
VALUES (
  'Зарядка высоковольтных батарей',
  'Восстановительная зарядка Li-ion, LiFePO4 и LTO батарей после глубокого разряда. Уникальное оборудование для одновременной работы с 96 ячейками.',
  'BatteryCharging',
  'от 2 часов',
  true
)
RETURNING id;
