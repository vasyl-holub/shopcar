"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Mail, X } from "lucide-react";
import { CarEditorModal, ACTIVE_KEY } from "@/components/garage/garage-modal";
import { PartRequestButton } from "@/components/requests/part-request-modal";
import { ShopIcon } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import { deleteCarAction } from "@/app/account/actions";
import type { UserCar } from "@/lib/api/account";
import { cn } from "@/lib/cn";

/** Прапорець авто: рамка 20 і помаранчевий квадрат 12, як у макеті */
function CarCheck({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden className="relative size-6 shrink-0">
      <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-[6px] border-2 border-orange bg-white" />
      {checked && (
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-orange" />
      )}
    </span>
  );
}

function Line({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex h-[30px] items-center text-[12px] leading-[1.33] text-black">
      {children}
    </p>
  );
}

function CarCard({
  car,
  active,
  onPick,
  onEdit,
  onRemove,
}: {
  car: UserCar;
  active: boolean;
  onPick: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const title = [car.brand, car.model, car.modification]
    .filter(Boolean)
    .join(" ");

  return (
    <li className="flex min-w-0 flex-col gap-[30px]">
      <div className="flex flex-col gap-2.5 border-b-2 border-line pb-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <button
          type="button"
          onClick={onPick}
          aria-pressed={active}
          className="flex cursor-pointer items-center gap-2.5 self-start py-2 text-[16px] font-semibold leading-[1.5] text-black lg:py-0"
        >
          <CarCheck checked={active} />
          {active ? "Зняти вибір авто" : "Вибрати авто"}
        </button>
        <div className="flex w-full items-center justify-between lg:w-auto lg:justify-start lg:gap-5">
          <button
            type="button"
            onClick={onEdit}
            className="flex cursor-pointer items-center gap-2.5 py-[9px] text-[14px] font-semibold leading-[1.4] text-[#121212] transition-opacity hover:opacity-70 lg:py-0"
          >
            Редагувати
            <ShopIcon name="pencil-alt" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex cursor-pointer items-center gap-2.5 py-[9px] text-[14px] font-semibold leading-[1.4] text-[#121212] transition-opacity hover:opacity-70 lg:py-0"
          >
            Видалити
            <X
              aria-hidden
              className="size-6 text-orange lg:size-5"
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      <div className="flex gap-5 max-lg:flex-col">
        <div className="flex w-[211px] shrink-0 flex-col gap-[5px] max-lg:contents">
          <div className="flex h-[125px] items-center justify-center rounded-[4px] bg-[#e6e6e6] max-lg:order-1 max-lg:h-[200px] max-lg:bg-white">
            <Car aria-hidden className="size-12 text-line" strokeWidth={1.25} />
          </div>
          <PartRequestButton
            className={cn(
              buttonClasses({ variant: "ghost" }),
              "w-full cursor-pointer justify-start gap-2.5 px-2.5 text-[12px] font-normal max-lg:order-3 max-lg:w-fit max-lg:px-1 max-lg:text-[14px]",
            )}
          >
            <Mail
              aria-hidden
              className="size-6 text-orange"
              strokeWidth={1.5}
            />
            Запит на підбір
          </PartRequestButton>
        </div>

        <div className="min-w-0 flex-1 max-lg:order-2">
          <p className="text-[14px] font-semibold leading-[1.4] text-black">
            {title}
          </p>
          {car.year ? <Line>Рік випуску: {car.year}</Line> : null}
          {car.litres ? <Line>Двигун: {car.litres} л</Line> : null}
          {car.driveDisplay ? <Line>Привод: {car.driveDisplay}</Line> : null}
          {car.vin ? <Line>VIN-код: {car.vin}</Line> : null}
        </div>
      </div>
    </li>
  );
}

/**
 * Мої авто за макетом: картки у дві колонки з вибором, редагуванням і
 * видаленням. Вибране авто лишається в браузері (як у вікні гаража).
 */
export function GarageCars({ cars }: { cars: UserCar[] }) {
  const router = useRouter();
  const [active, setActive] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [editor, setEditor] = useState<{ car?: UserCar } | null>(null);

  const pick = (id: string) => {
    const next = active === id ? "" : id;
    setActive(next);
    try {
      localStorage.setItem(ACTIVE_KEY, next);
    } catch {
      /* без сховища просто не запам'ятовуємо вибір */
    }
  };

  const remove = async (id: string) => {
    const data = new FormData();
    data.set("carId", id);
    await deleteCarAction(data);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-10">
      {cars.length === 0 ? (
        <p className="text-[16px] leading-[1.5] text-muted">
          У гаражі поки порожньо. Додайте авто — і підбір деталей піде швидше.
        </p>
      ) : (
        <ul className="grid gap-x-10 gap-y-[50px] md:grid-cols-2 md:gap-y-10 lg:gap-x-[100px]">
          {cars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              active={active === car.id}
              onPick={() => pick(car.id)}
              onEdit={() => setEditor({ car })}
              onRemove={() => remove(car.id)}
            />
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setEditor({})}
        className={buttonClasses({
          className: "w-full cursor-pointer sm:w-[240px]",
        })}
      >
        + ДОДАТИ АВТО
      </button>

      {editor && (
        <CarEditorModal
          car={editor.car}
          onClose={() => setEditor(null)}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}
