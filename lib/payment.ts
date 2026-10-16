/**
 * Реквізити для сторінки «Оплата». Взято зі сторінки
 * https://shopcar.ua/pages/payment/ (у макеті стояли тестові значення).
 */
export const paymentDetails = [
  { label: "Найменування отримувача :", value: "ФОП ЖЕПКО ОЛЕГ БОГДАНОВИЧ" },
  { label: "Код отримувача :", value: "3268409950" },
  {
    label: "Рахунок отримувача у форматі відповідно до стандарту IBAN :",
    value: "UA213257960000026009500737551",
  },
  { label: "Назва банку :", value: 'управління АТ "ОЩАДБАНК"' },
] as const;

/** QR-код для оплати за цими реквізитами (так само, як на shopcar.ua) */
export const paymentQr = {
  src: "/shop/img/payment-qr.png",
  alt: "QR-код для оплати за реквізитами",
  width: 344,
  height: 322,
} as const;

export const paymentTypes = [
  "В офісі компанії Shopcar готівкою",
  "Грошовий переказ (комісія 1%)",
] as const;

export const paymentNoticeFields = [
  "Дату оплати",
  "Суму",
  "Якщо Ваш рахунок оплачував інше особа-ПІБ фактичного платника",
] as const;

export const paymentEmail = "info@shopcar.ua";
