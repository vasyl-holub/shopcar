"use client";

import { useState } from "react";
import { Check, Link2, TriangleAlert } from "lucide-react";
import {
  FacebookBadge,
  TelegramBadge,
  ViberBadge,
} from "@/components/ui/icons";

/** Посилання формуємо на клієнті — на сервері домен залежить від оточення */
function currentUrl() {
  return typeof window === "undefined" ? "" : window.location.href;
}

/**
 * navigator.clipboard існує лише в захищеному контексті — HTTPS або
 * localhost. На http://local.westpart.ua його немає взагалі, тому
 * потрібен запасний шлях через приховане поле і execCommand.
 */
async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* Користувач відхилив дозвіл — пробуємо запасний шлях */
    }
  }

  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  /* fixed + opacity 0, щоб сторінка не смикнулась під час фокусу */
  field.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
  document.body.appendChild(field);
  field.select();
  field.setSelectionRange(0, text.length);

  let done = false;
  try {
    done = document.execCommand("copy");
  } catch {
    done = false;
  }
  field.remove();
  return done;
}

type CopyState = "idle" | "copied" | "failed";

export function ShareArticle({ title }: { title: string }) {
  const [state, setState] = useState<CopyState>("idle");

  const open = (build: (url: string, text: string) => string) => {
    const url = currentUrl();
    window.open(
      build(encodeURIComponent(url), encodeURIComponent(title)),
      "_blank",
      "noopener",
    );
  };

  const copy = async () => {
    const done = await copyToClipboard(currentUrl());
    setState(done ? "copied" : "failed");
    setTimeout(() => setState("idle"), 2500);
  };

  const badge =
    "inline-flex items-center justify-center transition-opacity hover:opacity-80";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[14px] leading-[1.5] text-grey-700">
        Поділитися:
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Поділитися у Viber"
          onClick={() => open((u, t) => `viber://forward?text=${t}%20${u}`)}
          className={badge}
        >
          <ViberBadge className="size-10" />
        </button>

        <button
          type="button"
          aria-label="Поділитися в Telegram"
          onClick={() =>
            open((u, t) => `https://t.me/share/url?url=${u}&text=${t}`)
          }
          className={badge}
        >
          <TelegramBadge className="size-10" />
        </button>

        <button
          type="button"
          aria-label="Поділитися у Facebook"
          onClick={() =>
            open((u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`)
          }
          className={badge}
        >
          <FacebookBadge className="size-10" />
        </button>

        <button
          type="button"
          onClick={copy}
          aria-label="Копіювати посилання на статтю"
          /* aria-live, щоб зміну підпису озвучив скрінрідер */
          className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors ${
            state === "copied"
              ? "border-green-300 text-green-300"
              : state === "failed"
                ? "border-danger-500 text-danger-700"
                : "border-grey-200 text-grey-700 hover:border-blue-300 hover:text-blue-300"
          }`}
        >
          {state === "copied" && (
            <>
              <Check className="size-4" strokeWidth={2.5} />
              Скопійовано
            </>
          )}
          {state === "failed" && (
            <>
              <TriangleAlert className="size-4" strokeWidth={2.25} />
              Не вдалося
            </>
          )}
          {state === "idle" && (
            <>
              <Link2 className="size-4" strokeWidth={2} />
              Копіювати
            </>
          )}
        </button>
      </div>

      <span aria-live="polite" className="sr-only">
        {state === "copied" && "Посилання скопійовано"}
        {state === "failed" && "Не вдалося скопіювати посилання"}
      </span>
    </div>
  );
}
