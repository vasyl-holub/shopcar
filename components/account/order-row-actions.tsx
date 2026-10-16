"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cancelOrderQuickAction } from "@/app/account/orders/actions";
import type { OrderComment } from "@/lib/api/orders";
import { cn } from "@/lib/cn";

const dt = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Значок «К»: коментарі до замовлення в підказці; без коментарів — блідий */
export function OrderComments({ comments }: { comments: OrderComment[] }) {
  const icon = (
    <MessageSquareText
      aria-hidden
      className={cn(
        "size-6 text-orange",
        comments.length === 0 && "opacity-30",
      )}
      strokeWidth={1.5}
    />
  );
  if (comments.length === 0) return icon;

  return (
    <Tooltip label="Коментарі до замовлення" trigger={icon}>
      <ul className="flex w-[260px] flex-col gap-3">
        {comments.map((c) => (
          <li key={c.id} className="flex flex-col">
            <span className="flex items-center justify-between gap-2">
              <span className="font-semibold">{c.author}</span>
              <span className="text-[12px] leading-4 text-muted">
                {dt(c.created)}
              </span>
            </span>
            <span className="whitespace-pre-line">{c.text}</span>
          </li>
        ))}
      </ul>
    </Tooltip>
  );
}

/** Кошик: скасовує замовлення (лише поки бекенд це дозволяє) */
export function OrderCancel({
  id,
  number,
}: {
  id: string;
  number: number | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Скасувати замовлення ${number ?? ""}`}
      onClick={() => {
        if (!window.confirm(`Скасувати замовлення ${number ?? ""}?`)) return;
        start(async () => {
          await cancelOrderQuickAction(id);
          router.refresh();
        });
      }}
      className="cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
    >
      <Trash2 aria-hidden className="size-6 text-orange" strokeWidth={1.5} />
    </button>
  );
}
