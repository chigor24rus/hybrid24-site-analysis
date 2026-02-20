-- Привязываем услугу "Зарядка высоковольтных батарей" (id=7)
-- только к моделям с тегами Электромобиль (1), Гибрид (2), PHEV (7)
INSERT INTO t_p13334878_hybrid24_site_analys.service_prices (service_id, brand_id, model_id, base_price, currency)
SELECT 
  7 as service_id,
  cm.brand_id,
  cmt.model_id,
  15000.00 as base_price,
  '₽' as currency
FROM t_p13334878_hybrid24_site_analys.car_model_tags cmt
JOIN t_p13334878_hybrid24_site_analys.car_models cm ON cmt.model_id = cm.id
WHERE cmt.tag_id IN (1, 2, 7)
GROUP BY cm.brand_id, cmt.model_id;
