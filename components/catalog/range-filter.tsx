"use client";

import { useId } from "react";

export type Range = { min: number; max: number };

/**
 * Діапазон «від — до» за макетом: два числові поля по 42px і під ними
 * доріжка з двома оранжевими повзунками. Нативні input[type=range]
 * лежать один поверх одного: так лишається керування з клавіатури й
 * доступність, яких не дає доріжка на div-ах.
 */
export function RangeFilter({
  label,
  bounds,
  value,
  onChange,
  step = 1,
}: {
  /** Назва для скрінрідера: видимий заголовок тримає група фільтра */
  label: string;
  bounds: Range;
  value: Range;
  onChange: (next: Range) => void;
  step?: number;
}) {
  const id = useId();

  /* Межі можуть схлопнутись: якщо в усіх пропозицій однаковий залишок,
     min і max рівні. Тоді діапазон не має сенсу — показуємо лише поля,
     а доріжку ховаємо, інакше ділення на нуль рознесло б розмітку. */
  const collapsed = bounds.max <= bounds.min;
  const span = bounds.max - bounds.min || 1;

  const clamp = (n: number) =>
    Number.isFinite(n)
      ? Math.min(bounds.max, Math.max(bounds.min, n))
      : bounds.min;

  /* Відсотки рахуємо вже за обмеженими значеннями, тож заливка доріжки
     фізично не може вилізти за її краї */
  const left = ((clamp(value.min) - bounds.min) / span) * 100;
  const right = ((clamp(value.max) - bounds.min) / span) * 100;

  /* Повзунки не перестрибують один одного й не виходять за межі */
  const setMin = (n: number) =>
    onChange({ min: Math.min(clamp(n), value.max), max: value.max });
  const setMax = (n: number) =>
    onChange({ min: value.min, max: Math.max(clamp(n), value.min) });

  /* Поки поле порожнє, не підставляємо нуль — інакше неможливо стерти
     значення й надрукувати нове */
  const read = (raw: string, fallback: number) =>
    raw.trim() === "" ? fallback : Number(raw);

  const field =
    "h-[42px] w-full min-w-0 rounded-[4px] border border-[#e6e6e6] bg-white px-[9px] " +
    "text-[16px] leading-[1.5] text-shop-black outline-none transition-colors " +
    "focus:border-orange disabled:cursor-not-allowed disabled:text-muted";
  const thumb =
    "pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none " +
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:appearance-none " +
    "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-orange " +
    "focus-visible:outline-none focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-orange/40";

  return (
    <div className="flex flex-col gap-2.5 px-2">
      <div className="flex items-center gap-1">
        <label className="sr-only" htmlFor={`${id}-min`}>
          {label}, від
        </label>
        <input
          id={`${id}-min`}
          type="number"
          inputMode="numeric"
          className={`tnum ${field}`}
          value={value.min}
          min={bounds.min}
          max={bounds.max}
          step={step}
          disabled={collapsed}
          onChange={(e) => setMin(read(e.target.value, bounds.min))}
        />
        <span aria-hidden className="text-[16px] leading-[1.5] text-shop-black">
          -
        </span>
        <label className="sr-only" htmlFor={`${id}-max`}>
          {label}, до
        </label>
        <input
          id={`${id}-max`}
          type="number"
          inputMode="numeric"
          className={`tnum ${field}`}
          value={value.max}
          min={bounds.min}
          max={bounds.max}
          step={step}
          disabled={collapsed}
          onChange={(e) => setMax(read(e.target.value, bounds.max))}
        />
      </div>

      {!collapsed && (
        <div className="relative mx-2.5 h-6">
          <span
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line"
          />
          <span
            aria-hidden
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-orange"
            style={{ left: `${left}%`, right: `${100 - right}%` }}
          />
          <input
            type="range"
            aria-label={`${label}, мінімум`}
            className={thumb}
            min={bounds.min}
            max={bounds.max}
            step={step}
            value={clamp(value.min)}
            onChange={(e) => setMin(Number(e.target.value))}
          />
          <input
            type="range"
            aria-label={`${label}, максимум`}
            className={thumb}
            min={bounds.min}
            max={bounds.max}
            step={step}
            value={clamp(value.max)}
            onChange={(e) => setMax(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
}
