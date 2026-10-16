import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Чотири шини, повернуті на 45° і накладені одна на одну — графіка
 * помаранчевих банерів. Розмір задається змінною --s (сторона квадрата):
 * [--s:130px] lg:[--s:190px] у className.
 */
export function TyreStack({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none flex items-center", className)}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex shrink-0 items-center justify-center"
          style={{
            width: "var(--s)",
            height: "var(--s)",
            marginRight: i < 3 ? "calc(var(--s) * -0.593)" : 0,
          }}
        >
          <div
            className="relative -rotate-45"
            style={{
              width: "calc(var(--s) * 0.627)",
              height: "calc(var(--s) * 0.788)",
            }}
          >
            <Image
              src="/shop/img/tyre.png"
              alt=""
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
