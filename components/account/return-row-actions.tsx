"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { deleteReturnAction } from "@/app/account/returns/actions";
import { cn } from "@/lib/cn";

/** Значок «К»: коментар менеджера з підказкою; без коментаря — блідий */
export function ReturnComment({ comment }: { comment: string }) {
  const icon = (
    <MessageSquareText
      aria-hidden
      className={cn("size-6 text-orange", !comment && "opacity-30")}
      strokeWidth={1.5}
    />
  );
  if (!comment) return icon;
  return (
    <Tooltip label="Коментар менеджера" trigger={icon}>
      <span className="block max-w-[320px] whitespace-pre-line">{comment}</span>
    </Tooltip>
  );
}

/** Кошик у кінці рядка: видаляє повернення після підтвердження */
export function ReturnDelete({ id, number }: { id: string; number: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Видалити повернення ${number}`}
      onClick={() => {
        if (!window.confirm(`Видалити повернення ${number}?`)) return;
        start(async () => {
          await deleteReturnAction(id);
          router.refresh();
        });
      }}
      className="cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
    >
      <Trash2 aria-hidden className="size-6 text-orange" strokeWidth={1.5} />
    </button>
  );
}
