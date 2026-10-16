import { cn } from "@/lib/cn";

/* Поля за макетом: радіус 8, висота 48, текст 16/1.5, рамка grey-300 —
   так само, як у пошуку на головній */
const control =
  "h-12 w-full rounded-[8px] border bg-white px-4 text-[16px] leading-[1.5] " +
  "text-black-900 transition-colors placeholder:text-grey-600 " +
  "focus:outline-none focus:ring-2 disabled:opacity-50";

const normal = "border-grey-300 focus:border-blue-300 focus:ring-blue-300/20";
const invalid =
  "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[16px] font-medium leading-[1.5] text-black-900"
      >
        {label}
        {required && <span className="ml-1 text-danger-500">*</span>}
      </label>

      {children}

      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-[14px] leading-[1.5] text-danger-700"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p className="text-[14px] leading-[1.5] text-grey-600">{hint}</p>
        )
      )}
    </div>
  );
}

export function Input({
  invalid: isInvalid,
  className,
  ...props
}: React.ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      className={cn(control, isInvalid ? invalid : normal, className)}
      aria-invalid={isInvalid || undefined}
      {...props}
    />
  );
}

export function Select({
  invalid: isInvalid,
  className,
  children,
  ...props
}: React.ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <select
      className={cn(
        control,
        isInvalid ? invalid : normal,
        /* Прибираємо системну стрілку й малюємо свою — інакше вигляд
           селекта різниться між Windows, macOS і Android */
        "cursor-pointer appearance-none bg-[length:20px] bg-[right_16px_center] bg-no-repeat pr-12",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23101010' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      aria-invalid={isInvalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  invalid: isInvalid,
  className,
  ...props
}: React.ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(
        control,
        isInvalid ? invalid : normal,
        /* control задає фіксовану висоту під однорядкові поля —
           для багаторядкового її треба зняти */
        "h-auto min-h-[120px] py-3",
        className,
      )}
      aria-invalid={isInvalid || undefined}
      {...props}
    />
  );
}
