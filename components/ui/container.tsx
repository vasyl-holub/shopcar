import { cn } from "@/lib/cn";

export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1280px] px-2.5 lg:px-10", className)}
      {...props}
    />
  );
}
