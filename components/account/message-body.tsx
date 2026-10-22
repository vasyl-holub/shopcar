"use client";

import { useEffect, useRef, useState } from "react";
import { loadMessageTextAction } from "@/app/account/messages-actions";

/** Чи схоже на HTML-лист: тоді показуємо його оформленим, а не розміткою */
const looksLikeHtml = (text: string) => /<\/?[a-z][\s\S]*?>/i.test(text);

/**
 * Стилі листа. Листи магазину прийшли з власною версткою (Arial 11–12px,
 * таблиці з рамками), тож тут вона приводиться до вигляду сайту: шрифт
 * Montserrat, 14px, оранжеві посилання, відступи, таблиці не ширші за вікно.
 * Рамки й заливки таблиць лишаються з листа.
 */
const BASE = `<base target="_blank">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
<style>
html,body{margin:0;padding:0;background:#fff}
html{overflow-y:hidden;overflow-x:auto}
body{padding:20px;font:400 14px/1.4 Montserrat,Arial,sans-serif;color:#121212;word-break:break-word}
body *{font-family:Montserrat,Arial,sans-serif !important}
p,div,span,td,th,li,font{font-size:14px !important;line-height:1.4 !important}
h1,h2,h3,h4{font-size:18px !important;line-height:1.3 !important;font-weight:600 !important;margin:0 0 14px !important}
a{color:#ff6100 !important}
img{max-width:100%;height:auto}
table{max-width:100%}
td,th{padding:6px 8px !important}
</style>`;

/**
 * Листи ведуть на адмінку бекенда («Подивитися замовлення» →
 * manage.shopcar.ua/orders/565725/). Клієнту туди заходити не треба: такі
 * посилання переписуємо на сторінки нашого кабінету й відкриваємо в тому ж
 * вікні. Решта посилань лишаються як є і відкриваються в новій вкладці.
 */
function ownLink(href: string) {
  let url: URL;
  try {
    url = new URL(href, "https://site.invalid");
  } catch {
    return null;
  }
  if (url.hostname !== "site.invalid") {
    if (!/(^|\.)(shopcar|westpart)\.ua$/i.test(url.hostname)) return null;
  }

  const order = url.pathname.match(/^\/orders\/(\d+)\/?$/);
  if (order) return `/account/orders?number=${order[1]}`;
  if (/pay/i.test(url.pathname)) return "/account/payments";
  return null;
}

/* Відносні адреси в srcdoc розв'язуються від адреси нашої сторінки */
const rewriteLinks = (html: string) =>
  html.replace(
    /<a\b([^>]*?)\bhref\s*=\s*(["'])(.*?)\2([^>]*)>/gi,
    (all, before: string, quote: string, href: string, after: string) => {
      const own = ownLink(href.replace(/&amp;/g, "&"));
      return own
        ? `<a${before} href=${quote}${own}${quote} target="_top"${after}>`
        : all;
    },
  );

/** Стилі йдуть у `<head>` листа, а якщо його немає — перед текстом */
const withBase = (source: string) => {
  const html = rewriteLinks(source);
  return /<\/head>/i.test(html)
    ? html.replace(/<\/head>/i, `${BASE}</head>`)
    : BASE + html;
};

/**
 * Текст повідомлення кабінету. Лист магазину приходить повним HTML-документом
 * (із `<html>`, `<style>`, таблицею замовлення), і виводити його як текст
 * не можна: людина бачить код. Тому такий лист показуємо в ізольованому вікні:
 * `sandbox` без `allow-scripts` не виконує скриптів, `allow-same-origin`
 * потрібен лише щоб підігнати висоту вікна під вміст. Висота стежить за
 * змістом: логотип і шрифт підвантажуються пізніше за розмітку.
 * Звичайний текст лишається абзацом з переносами рядків.
 */
export function MessageBody({ text }: { text: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const watcher = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(200);

  const fit = () => {
    const doc = frame.current?.contentDocument;
    if (!doc?.body) return;
    setHeight(Math.ceil(doc.body.getBoundingClientRect().height) + 2);
    watcher.current?.disconnect();
    watcher.current = new ResizeObserver(() =>
      setHeight(Math.ceil(doc.body.getBoundingClientRect().height) + 2),
    );
    watcher.current.observe(doc.body);
  };

  /* Вікно з srcDoc може завантажитися ще до гідратації — тоді onLoad уже
     не спрацює, тож перевіряємо готовність і при монтуванні */
  useEffect(() => {
    if (frame.current?.contentDocument?.readyState === "complete") fit();
    return () => watcher.current?.disconnect();
  }, []);

  if (!looksLikeHtml(text)) {
    return (
      <p className="whitespace-pre-line text-[14px] font-normal leading-[1.4] text-[#121212]">
        {text}
      </p>
    );
  }

  return (
    <iframe
      ref={frame}
      title="Текст повідомлення"
      sandbox="allow-same-origin allow-popups allow-top-navigation-by-user-activation"
      srcDoc={withBase(text)}
      onLoad={fit}
      style={{ height }}
      className="block w-full overflow-hidden rounded-[4px] border border-line bg-white"
    />
  );
}

/**
 * Лист кабінету, який підвантажується при відкритті: у списку тексту немає,
 * бо повні HTML-листи робили відкриття кабінету хвилинним. Уже завантажені
 * тексти лишаються в пам'яті, повторне відкриття миттєве.
 */
const loaded = new Map<string, string>();

export function MessageText({ id }: { id: string }) {
  const [text, setText] = useState<string | null>(loaded.get(id) ?? null);

  useEffect(() => {
    if (loaded.has(id)) return;
    let alive = true;
    loadMessageTextAction(id).then((value) => {
      loaded.set(id, value);
      if (alive) setText(value);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (text === null)
    return (
      <p className="text-[14px] leading-[1.4] text-muted">Завантаження…</p>
    );
  if (!text) return null;
  return <MessageBody text={text} />;
}
