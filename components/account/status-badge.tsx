import { cn } from "@/lib/cn";
import type { StatusTone } from "@/lib/api/orders";

const tones: Record<StatusTone, string> = {
  neutral: "bg-grey-100 text-grey-700",
  progress: "bg-blue-25 text-blue-300",
  waiting: "bg-yellow-300/20 text-grey-800",
  done: "bg-green-50 text-green-300",
  failed: "bg-danger-50 text-danger-700",
};

export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-[6px] px-2.5 text-[13px] font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
