/**
 * У профілі бекенд має лише текстове поле «Одержувач» (окремого телефону
 * одержувача немає), тому телефон зберігаємо в його кінці: «Прізвище Ім'я, +380…».
 * Так він доходить і до менеджера, а ми розбираємо його назад на два поля.
 */
const PHONE_TAIL = /[,;|]\s*(\+?\d[\d\s()-]{7,}\d)\s*$/;

export function splitRecipient(raw: string | null | undefined) {
  const text = (raw ?? "").trim();
  const match = PHONE_TAIL.exec(text);
  if (!match) return { name: text, phone: "" };
  return { name: text.slice(0, match.index).trim(), phone: match[1].trim() };
}

export function joinRecipient(name: string, phone: string) {
  const n = name.trim();
  const p = phone.trim();
  return p ? (n ? `${n}, ${p}` : p) : n;
}
