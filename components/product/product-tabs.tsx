"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type TabKey = "offers" | "about" | "reviews";

/**
 * Три вкладки під описом товару: «Пропозиції», «Про виробника» і
 * «Відгуки (N)». Активна — оранжева кнопка, решта — текст із сірою
 * лінією знизу. Вміст усіх вкладок рендерить сервер і передає сюди.
 */
export function ProductTabs({
  offers,
  about,
  reviews,
  reviewCount,
  initial = "offers",
}: {
  offers: React.ReactNode;
  about: React.ReactNode;
  reviews: React.ReactNode;
  reviewCount: number;
  initial?: TabKey;
}) {
  const [tab, setTab] = useState<TabKey>(initial);

  /* Одна дитина замість трьох умовних: так React не вважає серверні
     елементи списком без key */
  const panels: Record<TabKey, React.ReactNode> = { offers, about, reviews };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "offers", label: "Пропозиції" },
    { key: "about", label: "Про виробника" },
    {
      key: "reviews",
      label: reviewCount > 0 ? `Відгуки (${reviewCount})` : "Відгуки",
    },
  ];

  return (
    <div className="flex flex-col gap-[30px] lg:gap-10">
      <div
        role="tablist"
        className="flex flex-col gap-2.5 lg:flex-row lg:gap-8"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 cursor-pointer px-7 py-[9px] text-[16px] font-semibold leading-[1.5] transition-colors",
              tab === t.key
                ? "rounded-[4px] bg-orange text-white"
                : "border-b border-muted text-shop-black hover:text-orange",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {panels[tab]}
      </div>
    </div>
  );
}
