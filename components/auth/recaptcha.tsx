"use client";

import { useEffect, useRef, useState } from "react";

type Grecaptcha = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    __onRecaptchaReady?: () => void;
  }
}

/* Скрипт вантажимо один раз на весь застосунок, скільки б віджетів не було */
let readyPromise: Promise<Grecaptcha> | null = null;

function loadRecaptcha(): Promise<Grecaptcha> {
  if (readyPromise) return readyPromise;

  readyPromise = new Promise<Grecaptcha>((resolve, reject) => {
    if (window.grecaptcha?.render) {
      resolve(window.grecaptcha);
      return;
    }

    window.__onRecaptchaReady = () => {
      if (window.grecaptcha) resolve(window.grecaptcha);
      else reject(new Error("grecaptcha недоступна"));
    };

    const script = document.createElement("script");
    script.src =
      "https://www.google.com/recaptcha/api.js?onload=__onRecaptchaReady&render=explicit&hl=uk";
    script.async = true;
    script.defer = true;
    script.onerror = () =>
      reject(new Error("Не вдалося завантажити reCAPTCHA"));
    document.head.appendChild(script);
  });

  return readyPromise;
}

export function Recaptcha({
  siteKey,
  name = "captcha",
  /* Змінюється після кожної невдалої відправки — токен одноразовий,
     тож віджет треба скидати, інакше друга спроба завжди провалиться */
  resetKey,
  error,
}: {
  siteKey: string;
  name?: string;
  resetKey?: number;
  error?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  /* У dev React монтує ефекти двічі — без прапорця Google лаявся б,
     що в цей елемент капчу вже відрендерено */
  const started = useRef(false);
  const [token, setToken] = useState("");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    loadRecaptcha()
      .then((grecaptcha) => {
        if (!host.current || widget.current !== null) return;
        widget.current = grecaptcha.render(host.current, {
          sitekey: siteKey,
          callback: setToken,
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      })
      .catch(() => setLoadError(true));
  }, [siteKey]);

  useEffect(() => {
    if (resetKey === undefined || widget.current === null) return;
    window.grecaptcha?.reset(widget.current);
    setToken("");
  }, [resetKey]);

  return (
    <div className="flex flex-col gap-1.5">
      <div ref={host} />
      <input type="hidden" name={name} value={token} />

      {loadError && (
        <p role="alert" className="text-[12.5px] leading-[1.4] text-danger-700">
          Не вдалося завантажити перевірку. Вимкніть блокувальник реклами й
          оновіть сторінку.
        </p>
      )}

      {error && !loadError && (
        <p role="alert" className="text-[12.5px] leading-[1.4] text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}
