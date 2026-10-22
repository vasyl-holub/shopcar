/**
 * Текст підказки у полі пошуку. Винесений окремо від компонента, щоб
 * серверні сторінки могли його імпортувати, не затягуючи клієнтський
 * модуль пошуку у свій граф.
 */
export const SEARCH_PLACEHOLDER = "Введіть артикул або VIN-код";

/** Коротший запит дає надто широку видачу — чекаємо на другий символ */
export const SEARCH_MIN_LENGTH = 2;

/**
 * VIN — рівно 17 символів без I, O та Q (їх виключили, щоб не плутати
 * з одиницею й нулем). Пошук товарів за VIN бекенд не вміє: productAll
 * приймає лише артикул. Тому такий запит ведемо на форму підбору.
 */
const VIN = /^[A-HJ-NPR-Z0-9]{17}$/i;

export function isVin(query: string) {
  return VIN.test(query.trim());
}

/**
 * Розкладка ЙЦУКЕН → QWERTY за місцем клавіші. Людина вводить артикул
 * (OC0002D, EC1234) при увімкненій кирилиці й отримує «щс0002в». Артикули
 * латиницею, тож такий запит читаємо так, ніби розкладка була англійська.
 * Українська і російська розкладки різняться кількома клавішами; тут
 * зведено обидві: і → s (як ы), и → b, ї → ], є → ', ґ → \.
 */
const LAYOUT: Record<string, string> = {
  й: "q",
  ц: "w",
  у: "e",
  к: "r",
  е: "t",
  н: "y",
  г: "u",
  ш: "i",
  щ: "o",
  з: "p",
  х: "[",
  ъ: "]",
  ї: "]",
  ф: "a",
  ы: "s",
  і: "s",
  в: "d",
  а: "f",
  п: "g",
  р: "h",
  о: "j",
  л: "k",
  д: "l",
  ж: ";",
  э: "'",
  є: "'",
  я: "z",
  ч: "x",
  с: "c",
  м: "v",
  и: "b",
  т: "n",
  ь: "m",
  б: ",",
  ю: ".",
  ґ: "\\",
};

/** Чи є в запиті кирилиця */
export function hasCyrillic(text: string) {
  return /[\u0400-\u04FF]/.test(text);
}

/**
 * Запит, прочитаний як набраний в англійській розкладці. Великі літери
 * лишаються великими. Якщо кирилиці в запиті немає — повертає той самий текст.
 */
export function fixLayout(text: string) {
  return text.replace(/[\u0400-\u04FF]/g, (ch) => {
    const low = ch.toLowerCase();
    const mapped = LAYOUT[low];
    if (!mapped) return ch;
    return ch === low ? mapped : mapped.toUpperCase();
  });
}

/**
 * Кириличні літери, що виглядають як латинські (А, В, Е, К, М, Н, О, Р, С, Т,
 * Х, І): артикул «CX010» легко набрати з кириличною «С» і «Х». Тут клавіші
 * ті самі, що й у латиниці, тож розкладка не допомагає — потрібна заміна
 * за виглядом.
 */
const LOOKALIKE: Record<string, string> = {
  а: "a",
  в: "b",
  е: "e",
  к: "k",
  м: "m",
  н: "h",
  о: "o",
  р: "p",
  с: "c",
  т: "t",
  х: "x",
  і: "i",
  у: "y",
};

export function fixLookalikes(text: string) {
  return text.replace(/[Ѐ-ӿ]/g, (ch) => {
    const low = ch.toLowerCase();
    const mapped = LOOKALIKE[low];
    if (!mapped) return ch;
    return ch === low ? mapped : mapped.toUpperCase();
  });
}

/**
 * Варіанти запиту, які пробуємо, коли за самим текстом нічого не знайшли:
 * спершу кириличні двійники латиниці, потім розкладка. Порожній список,
 * якщо кирилиці в запиті немає.
 */
export function queryVariants(text: string) {
  if (!hasCyrillic(text)) return [];
  const original = text.trim();
  return [...new Set([fixLookalikes(original), fixLayout(original)])].filter(
    (v) => v && v !== original && !hasCyrillic(v),
  );
}
