# GraphQL Queries - Завдання на структурування

## Опис
Перенести файли GraphQL запитів з `doc/graphql/` у підкаталоги відповідно до назв Django apps у `gvein/`.

**Кожен пункт = перенести файл** (створити в підкаталозі + видалити з кореневого каталогу).

---

## ✅ returns/ (gvein/returns/) - 11 файлів - ЗАВЕРШЕНО
- [x] returns.gql
- [x] returnsAll.gql
- [x] returnsNode.gql
- [x] returnReasons.gql
- [x] returnReactions.gql
- [x] changeReturnsDescription.gql
- [x] changeReturnsDispatchInfo.gql
- [x] deleteReturns.gql
- [x] ReturnOrderItem.gql
- [x] GetReturnRequests.gql
- [x] UpdateReturnRequestDescription.gql

---

## ✅ user/ (gvein/user/) - 11 файлів - ЗАВЕРШЕНО
- [x] ChangePassword.gql
- [x] GetCurrentUser.gql
- [x] Register.gql
- [x] Logout.gql
- [x] RequestPasswordReset.gql
- [x] ResetPassword.gql
- [x] UpdateCurrentUser.gql
- [x] UpdateUserCurrency.gql
- [x] GetUserCars.gql
- [x] SaveUserCar.gql
- [x] DeleteUserCar.gql

---

## ✅ order/ (gvein/order/) - 8 файлів - ЗАВЕРШЕНО
- [x] CreateOrder.gql
- [x] CreateOrderWithDelivery.gql
- [x] CancelOrder.gql
- [x] CancelOrderItems.gql
- [x] GetOrder.gql
- [x] GetOrders.gql
- [x] GetOrderItems.gql
- [x] CreateOrderComment.gql

---

## ✅ product/ (gvein/product/) - 23 файли - ЗАВЕРШЕНО
- [x] GetProductDetails.gql
- [x] GetProducts.gql
- [x] GetProductAnalogue.gql
- [x] GetProductCarUsage.gql
- [x] GetProductCrosses.gql
- [x] GetProductDiscountPrices.gql
- [x] GetProductInfo.gql
- [x] GetProductResourcesByProduct.gql
- [x] GetProductsFilter.gql
- [x] GetProductsHistory.gql
- [x] GetPromoProducts.gql
- [x] AddProductToFavourites.gql
- [x] AddProductToHistory.gql
- [x] RemoveProductFromFavourites.gql
- [x] GetFavouriteProducts.gql
- [x] GetBrand.gql
- [x] GetBrands.gql
- [x] GetManufacturer.gql
- [x] GetManufacturers.gql
- [x] GetModelDetails.gql
- [x] GetModels.gql
- [x] GetCategory.gql
- [x] GetCatalog.gql

---

## ✅ cart/ (gvein/cart/) - 6 файлів - ЗАВЕРШЕНО
- [x] AddCartItem.gql
- [x] AddCarToHistory.gql
- [x] GetCartItems.gql
- [x] ImportCartItems.gql
- [x] RemoveCartItem.gql
- [x] UpdateCartItem.gql

---

## ✅ delivery/ (gvein/delivery/) - 1 файл - ЗАВЕРШЕНО
- [x] GetDeliverMethods.gql

---

## ✅ payment/ (gvein/payment/) - 2 файли - ЗАВЕРШЕНО
- [x] CreatePaymentNotification.gql
- [x] GetPaymentNotifications.gql

---

## ✅ search/ (gvein/search/) - 4 файли - ЗАВЕРШЕНО
- [x] CreateSearchRequest.gql
- [x] GetSearchProductHistory.gql
- [x] GetSearchResults.gql
- [x] SearchProducts.gql

---

## ✅ content/ (gvein/content/) - 5 файлів - ЗАВЕРШЕНО
- [x] GetPage.gql
- [x] GetTextBox.gql
- [x] GetNewsDetails.gql
- [x] getNews.gql
- [x] GetShareDetails.gql

---

## ✅ informer/ (gvein/informer/) - 5 файлів - ЗАВЕРШЕНО
- [x] GetNotifications.gql
- [x] makeDeletedInformer.gql
- [x] makeReadInformer.gql
- [x] MarkAsDeleted.gql
- [x] MarkAsRead.gql

---

## ✅ report/ (gvein/report/) - 1 файл - ЗАВЕРШЕНО
- [x] GetReport.gql

---

## ✅ feedback/ (gvein/feedback/) - 1 файл - ЗАВЕРШЕНО
- [x] SendFeedback.gql

---

## ✅ currency/ (gvein/currency/) - 2 файли - ЗАВЕРШЕНО
- [x] GetCurrencies.gql
- [x] GetCurrencyDetails.gql

---

## ✅ locality/ (gvein/locality/) - 2 файли - ЗАВЕРШЕНО
- [x] GetCountries.gql
- [x] GetRegions.gql

---

## ✅ store/ (gvein/store/) - 1 файл - ЗАВЕРШЕНО
- [x] actionAll.gql

---

## ✅ account/ (gvein/account/) - 2 файли - ЗАВЕРШЕНО
- [x] GetAgreement.gql
- [x] GetStatements.gql

---

## ✅ files/ (gvein/files/) - 1 файл - ЗАВЕРШЕНО
- [x] GetDownloadFiles.gql

---

## ✅ webservice/ (gvein/webservice/) - 1 файл - ЗАВЕРШЕНО
- [x] GetAppKey.gql

---

## ✅ webstore/ (gvein/webstore/) - 1 файл - ЗАВЕРШЕНО
- [x] GetAdverts.gql

---

## ✅ comment/ (gvein/comment/) - 1 файл - ЗАВЕРШЕНО
- [x] GetVoteAll.gql

---

## ✅ car/ (gvein/car/) - 6 файлів - ЗАВЕРШЕНО
- [x] GetCarCategories.gql
- [x] GetCarCategoryParts.gql
- [x] GetCarChildrenCategories.gql
- [x] GetCarDetails.gql
- [x] GetCars.gql
- [x] GetCarSettings.gql

---

## Підсумок

| App | Файлів | Перенесено | Статус |
|-----|--------|------------|--------|
| returns | 11 | 11 | ✅ Завершено |
| user | 11 | 11 | ✅ Завершено |
| order | 8 | 8 | ✅ Завершено |
| product | 23 | 23 | ✅ Завершено |
| cart | 6 | 6 | ✅ Завершено |
| delivery | 1 | 1 | ✅ Завершено |
| payment | 2 | 2 | ✅ Завершено |
| search | 4 | 4 | ✅ Завершено |
| content | 5 | 5 | ✅ Завершено |
| informer | 5 | 5 | ✅ Завершено |
| report | 1 | 1 | ✅ Завершено |
| feedback | 1 | 1 | ✅ Завершено |
| currency | 2 | 2 | ✅ Завершено |
| locality | 2 | 2 | ✅ Завершено |
| store | 1 | 1 | ✅ Завершено |
| account | 2 | 2 | ✅ Завершено |
| files | 1 | 1 | ✅ Завершено |
| webservice | 1 | 1 | ✅ Завершено |
| webstore | 1 | 1 | ✅ Завершено |
| comment | 1 | 1 | ✅ Завершено |
| car | 6 | 6 | ✅ Завершено |
| **ВСЬОГО** | **95** | **95** | **100% виконано** |
