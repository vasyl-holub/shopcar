# GraphQL Schemas - Завдання на додавання прикладів запитів

## Опис
Переглянути всі GraphQL схеми в `gvein/` та додати приклади запитів (queries/mutations) у відповідні підкаталоги `doc/graphql/`.

**Кожен пункт = створити новий .gql файл** з прикладом запиту, який використовує відповідну схему.

---

## 📋 bonus/ (gvein/bonus/api/schema.py) - 2 файли

### Схема: `BonusQuery`
- [x] `GetOrderBonus.gql` - запит одного бонусу по ID (`order_bonus`)
- [x] `GetOrderBonuses.gql` - запит списку бонусів з фільтрацією (`order_bonuses`)

**Поля OrderBonusNode:** id, order, bonus_value, value, available_at, is_processed, account, created

---

## 📋 core/ (gvein/core/api/schema.py) - 4 файли

### Схема: `CoreQuery`
- [x] `GetGlobalConfig.gql` - запит глобальної конфігурації (`global_config`)
- [x] `GetCoreSettings.gql` - запит налаштувань (`can_user_change_profile`, `can_user_change_type`, `can_user_change_email`, `can_user_change_delivery`, `can_user_import_cart`, `allow_anonymous`, `store_item_max_count`, `delivery_self_pickup_id`, `get_delivery_apps`)
- [x] `GetLanguages.gql` - запит мов (`default_language`, `languages`)
- [x] `GetRobots.gql` - запит robots.txt та site_key (`robots`, `site_key`)

**Поля ConfigNode:** name, company_name, anonymous_checkout, default_page, only_available, buy_only_available, is_blocked, default_currency, user_currency, user_account_currency, default_sort, group_default_sort, show_currency, max_product_count, items_per_page, hide_info, cancel_order_days, default_pay_method, default_delivery, show_localstore_name, store_item_max_count

---

## 📋 discount/ (gvein/discount/api/schema.py) - 2 файли

### Схема: `DiscountQuery`
- [x] `GetDiscount.gql` - запит одного шаблону знижки по ID (`discount`)
- [x] `GetDiscounts.gql` - запит списку шаблонів знижок (`discount_all`)

**Поля DiscountTemplateNode:** id, name

---

## 📋 exporter/ (gvein/exporter/api/schema.py) - 3 файли

### Схема: `ExporterQuery`
- [x] `GetUploadFileNode.gql` - запит одного файлу по ID (`upload_file_node`)
- [x] `GetUploadFile.gql` - запит одного файлу (`upload_file`)
- [x] `GetUploadFiles.gql` - запит списку файлів (`upload_file_all`)

**Поля UploadFileNode:** name, file, url, slug, created, modified

---

## 📋 history/ (gvein/history/api/schema.py) - 8 файлів

### Схема: `HistoryQuery`
- [x] `GetHistoryProductNode.gql` - запит одного запису історії продуктів по ID (`history_product_node`)
- [x] `GetHistoryProduct.gql` - запит одного запису історії продуктів (`history_product`)
- [x] `GetHistoryProducts.gql` - запит списку історії продуктів з фільтрацією (`history_product_all`)
- [x] `GetHistoryCarNode.gql` - запит одного запису історії авто по ID (`history_car_node`)
- [x] `GetHistoryCar.gql` - запит одного запису історії авто (`history_car`)
- [x] `GetHistoryCars.gql` - запит списку історії авто (`history_car_all`)

### Схема: `HistoryMutation`
- [x] `AddHistoryProduct.gql` - мутація додавання продукту в історію (`add_history_product`)
- [x] `AddHistoryCar.gql` - мутація додавання авто в історію (`add_history_car`)

**Поля HistoryProductNode:** стандартні поля моделі HistoryProduct
**Поля HistoryCarNode:** стандартні поля моделі HistoryCar

---

## 📋 kit/ (gvein/kit/api/schema.py) - 4 файли

### Схема: `KitQuery`
- [x] `GetKitNode.gql` - запит одного комплекту по ID (`kit_node`)
- [x] `GetKit.gql` - запит одного комплекту (`kit`)
- [x] `GetKits.gql` - запит списку комплектів (`kit_all`)
- [x] `GetKitTypes.gql` - запит типів комплектів (`kit_types`)

**Поля KitNode:** id, type, price_data, products
**Поля KitPriceData:** main_product_price, selected_product_price, old_total, new_total

---

## 📋 request/ (gvein/request/api/schema.py) - 4 файли

### Схема: `RequestsQuery`
- [x] `GetVinRequestNode.gql` - запит одного VIN-запиту по ID (`vin_request_node`)
- [x] `GetVinRequest.gql` - запит одного VIN-запиту (`vin_request`)
- [x] `GetVinRequests.gql` - запит списку VIN-запитів (`vin_request_all`)
- [x] `GetRequestBodies.gql` - запит типів кузовів авто (`request_bodies`)

### Схема: `RequestsMutations`
- [x] `CreatePartRequest.gql` - мутація створення запиту на запчастину (`make_part_request`)

**Поля RequestNode:** стандартні поля моделі Request

---

## 📋 delivery/ (gvein/delivery/api/np_delivery_schema.py) - 10 файлів

### Схема: `NPQuery` (Нова Пошта)
- [x] `GetAreaNode.gql` - запит однієї області по ID (`area_node`)
- [x] `GetArea.gql` - запит однієї області (`area`)
- [x] `GetAreas.gql` - запит списку областей (`area_all`)
- [x] `GetCityNode.gql` - запит одного міста по ID (`city_node`)
- [x] `GetCity.gql` - запит одного міста (`city`)
- [x] `GetCities.gql` - запит списку міст з фільтрацією по області (`city_all`)
- [x] `GetWarehouseNode.gql` - запит одного відділення по ID (`warehouse_node`)
- [x] `GetWarehouse.gql` - запит одного відділення (`warehouse`)
- [x] `GetWarehouses.gql` - запит списку відділень з фільтрацією по місту (`warehouse_all`)
- [x] `GetStreetNode.gql` - запит однієї вулиці по ID (`street_node`)
- [x] `GetStreet.gql` - запит однієї вулиці (`street`)
- [x] `GetStreets.gql` - запит списку вулиць з фільтрацією по місту (`street_all`)
- [x] `GetNpDeliveryServiceTypes.gql` - запит типів доставки Нової Пошти (`np_delivery_service_types`)

---

## 📋 delivery/ (gvein/delivery/api/schema.py) - 2 файли (додатково)

### Схема: `DeliveryQuery`
- [x] `GetDeliveryNode.gql` - запит одного способу доставки по ID (`delivery_noded`)
- [x] `GetDelivery.gql` - запит одного способу доставки (`delivery`)
- [x] `GetDeliveries.gql` - запит списку способів доставки (`delivery_all`)
- [x] `GetDeliveryServiceTypes.gql` - запит типів доставки (`delivery_service_types`)

**Поля DeliveryNode:** id, name, is_active, is_show, has_plugin

---

## 📋 locality/ (gvein/locality/schema.py) - 4 файли (додатково до існуючих)

### Схема: `LocalityQuery` (додаткові запити)
- [x] `GetCountryNode.gql` - запит однієї країни по ID (`country`)
- [x] `GetCountriesAll.gql` - запит списку всіх країн (`country_all`)
- [x] `GetRegionNode.gql` - запит одного регіону по ID (`region`)
- [x] `GetRegionsAll.gql` - запит списку всіх регіонів з фільтрацією по країні (`region_all`)

---

## Підсумок

| App | Файлів schema | Нових .gql файлів | Статус |
|-----|---------------|-------------------|--------|
| bonus | 1 | 2 | ✅ Виконано |
| core | 1 | 4 | ✅ Виконано |
| discount | 1 | 2 | ✅ Виконано |
| exporter | 1 | 3 | ✅ Виконано |
| history | 1 | 8 | ✅ Виконано |
| kit | 1 | 4 | ✅ Виконано |
| request | 1 | 5 | ✅ Виконано |
| delivery (NP) | 1 | 13 | ✅ Виконано |
| delivery (api) | 1 | 4 | ✅ Виконано |
| locality (додатково) | 1 | 4 | ✅ Виконано |
| **ВСЬОГО** | **10** | **49** | **100% виконано** |

---

## Примітки

1. **Apps, які вже мають .gql файли** (не потребують нових):
   - account, cart, comment, content, currency, feedback, files, informer, order, payment, product, report, returns, search, store, user, webservice, webstore, car

2. **Формат .gql файлів** має відповідати існуючим прикладам:
   - Використовувати GraphQL синтаксис
   - Вказувати назву запиту/мутації
   - Включати всі необхідні аргументи
   - Повертати релевантні поля

3. **Структура каталогів**:
   - `doc/graphql/bonus/` - для bonus запитів
   - `doc/graphql/core/` - для core запитів
   - `doc/graphql/discount/` - для discount запитів
   - `doc/graphql/exporter/` - для exporter запитів
   - `doc/graphql/history/` - для history запитів
   - `doc/graphql/kit/` - для kit запитів
   - `doc/graphql/request/` - для request запитів
   - `doc/graphql/delivery/` - для delivery запитів (розширити існуючий)
   - `doc/graphql/locality/` - для locality запитів (розширити існуючий)
