"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ShopIcon } from "@/components/ui/shop-icon";
import { cn } from "@/lib/cn";

/**
 * Вікно за макетом: біла картка до 600px, рамка #BBB, тінь, хрестик у куті.
 * Заголовок стоїть на місці, вміст прокручується всередині вікна.
 */
export function Modal({
  title,
  hideTitle,
  titleMobileOnly,
  tightTitle,
  header,
  footer,
  subtitle,
  compact,
  wide,
  onClose,
  children,
}: {
  title: string;
  /** Без видимого заголовка (напр. вікно гаража): title лишається для скрінрідера */
  hideTitle?: boolean;
  /** Заголовок лише на планшеті: на десктопі його малює вміст вікна */
  titleMobileOnly?: boolean;
  /** Без відступу під заголовком на планшеті: далі одразу кнопка чи рядок */
  tightTitle?: boolean;
  /** Власна шапка замість центрованого заголовка (напр. заголовок і кнопка в рядок) */
  header?: React.ReactNode;
  /** Підвал під прокруткою: кнопка лишається на місці */
  footer?: React.ReactNode;
  /** Рядок під заголовком (напр. «Пропустити та заповнити пізніше») */
  subtitle?: React.ReactNode;
  /** Вищі вікна (форма авто): відступ від країв екрана 24, а не 72 */
  compact?: boolean;
  /** Широке вікно 1000 на десктопі (форма повернення) */
  wide?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-2.5",
        compact ? "py-6" : "py-6 lg:py-[72px]",
      )}
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-full w-full max-w-[400px] flex-col rounded-[4px] border border-line bg-white shadow-[0_4px_2px_rgba(0,0,0,0.25)]",
          wide ? "lg:max-w-[1000px]" : "lg:max-w-[600px]",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className={cn(
            "absolute flex size-[42px] cursor-pointer items-center justify-center transition-opacity hover:opacity-70 lg:right-[9px] lg:top-[9px] lg:size-6",
            hideTitle ? "right-0 top-0" : "right-2.5 top-2.5",
          )}
        >
          <ShopIcon name="modal-close" />
        </button>
        {header && (
          <div className="px-2.5 pb-[30px] pt-2.5 lg:px-10 lg:pt-10">
            {header}
          </div>
        )}
        {!hideTitle && !header && (
          <div
            className={cn(
              "px-2.5 pt-2.5 text-center lg:px-10 lg:pt-10",
              titleMobileOnly && "lg:hidden",
              tightTitle && "max-lg:pb-0",
              subtitle ? "pb-1 lg:pb-[15px]" : "pb-[30px]",
            )}
          >
            <p className="flex h-[42px] items-center justify-center text-[16px] font-semibold leading-[1.5] text-[#121212] lg:block lg:h-auto">
              {title}
            </p>
          </div>
        )}
        {subtitle && (
          <div className="px-2.5 pb-[15px] text-center lg:px-10 lg:pb-[30px]">
            {subtitle}
          </div>
        )}
        <div
          className={cn(
            "scrollbar-orange min-h-0 flex-1 overflow-y-auto px-2.5 pb-2.5 lg:px-10 lg:pb-10",
            (hideTitle || titleMobileOnly) && !header && "lg:pt-10",
            hideTitle &&
              !header &&
              "px-[30px] pb-[30px] pt-[42px] lg:px-10 lg:pb-10",
            footer && "pb-0 lg:pb-0",
          )}
        >
          {children}
        </div>
        {footer && (
          <div className="flex justify-center px-2.5 pb-2.5 pt-5 lg:px-10 lg:pb-10">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
