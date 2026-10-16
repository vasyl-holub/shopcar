"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  UnderlineField,
  UnderlineSelect,
} from "@/components/checkout/checkout-fields";
import { Modal } from "@/components/ui/modal";
import { ShopIcon } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import {
  deleteCarAction,
  saveCarAction,
  type AccountFormState,
} from "@/app/account/actions";
import {
  garageCarsAction,
  garageOptionsAction,
} from "@/app/account/garage-action";
import type { CarAttributes, UserCar } from "@/lib/api/account";

const NO_OPTIONS: CarAttributes = {
  types: [],
  bodies: [],
  transmissions: [],
  drives: [],
};

/** Форма «Додати авто»: поля за макетом, внизу «ЗБЕРЕГТИ» і перехід до списку */
function AddCarForm({
  car,
  onSaved,
  onBack,
}: {
  /** Редагування наявного авто: поля заповнені, id йде в запит */
  car?: UserCar;
  onSaved: () => void;
  onBack: () => void;
}) {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(
    saveCarAction,
    {},
  );
  const [options, setOptions] = useState<CarAttributes>(NO_OPTIONS);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  /* Значення полів: що ввів користувач, інакше дані авто, яке редагуємо */
  const val = (key: string, fallback?: string | number | null) =>
    v[key] ?? (fallback != null ? String(fallback) : undefined);

  const [type, setType] = useState(v.type ?? "");
  const [body, setBody] = useState(v.body ?? "");
  const [transmission, setTransmission] = useState(v.transmission ?? "");
  const [drive, setDrive] = useState(v.drive ?? "");

  useEffect(() => {
    let alive = true;
    garageOptionsAction().then((o) => {
      if (!alive) return;
      setOptions(o);
      /* Бекенд віддає авто з підписами, а не кодами: підписи шукаємо в довідниках */
      const code = (
        list: { value: string; label: string }[],
        label?: string | null,
      ) => list.find((x) => x.label === label)?.value ?? "";
      if (car) {
        setType(code(o.types, car.typeDisplay));
        setBody(code(o.bodies, car.bodyDisplay));
        setTransmission(code(o.transmissions, car.transmissionDisplay));
        setDrive(code(o.drives, car.driveDisplay));
      }
      /* Тип авто обов'язковий: за замовчуванням — перший, зазвичай «Легкові» */
      setType((cur) => cur || o.types[0]?.value || "");
    });
    return () => {
      alive = false;
    };
  }, [car]);

  useEffect(() => {
    if (state.ok) onSaved();
  }, [state.ok, onSaved]);

  return (
    <form action={action} noValidate className="flex flex-col gap-[30px]">
      {car && <input type="hidden" name="id" value={car.id} />}
      {car?.vin && <input type="hidden" name="vin" value={car.vin} />}
      {state.formError && (
        <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
          {state.formError}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <UnderlineSelect
          name="type"
          label="Тип авто"
          value={type}
          onChange={setType}
          options={options.types}
          error={e.type}
        />
        <UnderlineField
          id="car-year"
          name="year"
          label="Рік випуску"
          defaultValue={val("year", car?.year)}
          error={e.year}
        />
        <UnderlineField
          id="car-brand"
          name="brand"
          label="Марка авто"
          defaultValue={val("brand", car?.brand)}
          error={e.brand}
        />
        <UnderlineField
          id="car-model"
          name="model"
          label="Модель"
          defaultValue={val("model", car?.model)}
          error={e.model}
        />
        <UnderlineField
          id="car-modification"
          name="modification"
          label="Модифікація"
          defaultValue={val("modification", car?.modification)}
          error={e.modification}
        />
        <UnderlineField
          id="car-litres"
          name="litres"
          label="Об'єм двигуна"
          defaultValue={val("litres", car?.litres)}
          error={e.litres}
        />
        <UnderlineSelect
          name="body"
          label="Кузов"
          value={body}
          onChange={setBody}
          options={options.bodies}
          error={e.body}
        />
        <UnderlineSelect
          name="transmission"
          label="Трансмісія"
          value={transmission}
          onChange={setTransmission}
          options={options.transmissions}
        />
        <UnderlineSelect
          name="drive"
          label="Привід"
          value={drive}
          onChange={setDrive}
          options={options.drives}
        />
      </div>

      <div className="flex flex-col gap-2.5 lg:flex-row lg:gap-[30px]">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({
            className: "cursor-pointer uppercase lg:flex-1",
          })}
        >
          {pending ? "Зберігаємо…" : "Зберегти"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className={buttonClasses({
            variant: "outline",
            className: "cursor-pointer uppercase lg:flex-1",
          })}
        >
          Перейти в мої авто
        </button>
      </div>
    </form>
  );
}

export const ACTIVE_KEY = "shopcar:active-car";

/** Прапорець авто: рамка 20 і помаранчевий квадрат 12, як у макеті */
function CarCheck({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="relative size-6 shrink-0 cursor-pointer"
    >
      <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-[6px] border-2 border-orange bg-white" />
      {checked && (
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-orange" />
      )}
    </button>
  );
}

/** Список авто або порожній стан гаража */
function CarList({
  cars,
  onAdd,
  onEdit,
  onChanged,
  onClose,
}: {
  cars: UserCar[] | null;
  onAdd: () => void;
  onEdit: (car: UserCar) => void;
  onChanged: () => void;
  onClose: () => void;
}) {
  /* Вікно відкривається лише в браузері, тож сховище доступне одразу */
  const [active, setActive] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const pick = (id: string) => {
    const next = active === id ? "" : id;
    setActive(next);
    try {
      localStorage.setItem(ACTIVE_KEY, next);
    } catch {
      /* без сховища просто не запам'ятовуємо вибір */
    }
  };

  const remove = async (ids: string[]) => {
    for (const id of ids) {
      const data = new FormData();
      data.set("carId", id);
      await deleteCarAction(data);
    }
    onChanged();
  };

  const add = (
    <button
      type="button"
      onClick={onAdd}
      className={buttonClasses({
        className: "w-full cursor-pointer lg:flex-1",
      })}
    >
      + ДОДАТИ АВТО
    </button>
  );

  if (!cars || cars.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[15px] rounded-[4px] border border-dashed border-muted py-[30px]">
        <p className="text-[14px] font-semibold leading-[1.4] text-[#121212]">
          {cars ? "Немає авто в гаражі" : "Завантаження…"}
        </p>
        {cars && (
          <button
            type="button"
            onClick={onAdd}
            className={buttonClasses({ className: "w-[240px] cursor-pointer" })}
          >
            + ДОДАТИ АВТО
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 lg:gap-[30px]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[16px] font-semibold leading-[1.5] text-[#121212] max-lg:hidden">
          Мої авто
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Видалити всі авто з гаража?"))
              remove(cars.map((c) => c.id));
          }}
          className="h-9 shrink-0 cursor-pointer rounded-[4px] border border-orange px-3 text-[14px] font-semibold leading-[1.4] text-[#121212] transition-colors hover:bg-peach"
        >
          Видалити всі авто
        </button>
      </div>

      <ul className="flex flex-col gap-5">
        {cars.map((car) => {
          const title = [car.brand, car.model, car.modification]
            .filter(Boolean)
            .join(" ");
          return (
            <li key={car.id} className="flex items-start gap-2.5">
              <CarCheck
                checked={active === car.id}
                label={`Обрати: ${title}`}
                onChange={() => pick(car.id)}
              />
              <div className="flex min-w-0 flex-1 flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-2.5">
                <div className="flex min-w-0 flex-1 flex-col gap-[5px] text-[#121212]">
                  <p className="text-[14px] font-semibold leading-[1.4]">
                    {title}
                  </p>
                  {car.year ? (
                    <p className="text-[12px] leading-[1.33]">
                      Рік випуску: {car.year}
                    </p>
                  ) : null}
                  {car.litres ? (
                    <p className="text-[12px] leading-[1.33]">
                      Двигун: {car.litres} л
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-0.5 max-lg:self-end lg:gap-5">
                  <Link
                    href={`/catalog-search?name=${encodeURIComponent(`${car.brand} ${car.model}`)}`}
                    onClick={onClose}
                    aria-label={`Шукати запчастини: ${title}`}
                    className="flex size-[42px] items-center justify-center transition-opacity hover:opacity-70 lg:size-6"
                  >
                    <ShopIcon name="search" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onEdit(car)}
                    aria-label={`Редагувати: ${title}`}
                    className="flex size-[42px] cursor-pointer items-center justify-center transition-opacity hover:opacity-70 lg:size-6"
                  >
                    <ShopIcon name="pencil-alt" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove([car.id])}
                    aria-label={`Видалити: ${title}`}
                    className="flex size-[42px] cursor-pointer items-center justify-center transition-opacity hover:opacity-70 lg:size-6"
                  >
                    <ShopIcon name="remove-x" size={14} className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2.5 lg:flex-row lg:gap-[30px]">
        {add}
        <Link
          href="/account/garage"
          onClick={onClose}
          className={buttonClasses({
            variant: "outline",
            className: "w-full lg:flex-1",
          })}
        >
          ПЕРЕЙТИ В МОЇ АВТО
        </Link>
      </div>
    </div>
  );
}

function GarageModal({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<"list" | "add">("list");
  const [editing, setEditing] = useState<UserCar | undefined>();
  const [cars, setCars] = useState<UserCar[] | null>(null);

  const load = () => {
    setCars(null);
    garageCarsAction().then(setCars);
  };

  useEffect(() => {
    let alive = true;
    garageCarsAction().then((c) => alive && setCars(c));
    return () => {
      alive = false;
    };
  }, []);

  if (view === "add") {
    return (
      <Modal
        title={editing ? "Редагувати авто" : "Додати авто"}
        compact
        onClose={onClose}
      >
        <AddCarForm
          car={editing}
          onSaved={() => {
            load();
            setView("list");
          }}
          onBack={() => setView("list")}
        />
      </Modal>
    );
  }

  return (
    <Modal
      title="Мої авто"
      {...(cars && cars.length > 0
        ? { titleMobileOnly: true, tightTitle: true }
        : { hideTitle: true })}
      onClose={onClose}
    >
      <CarList
        cars={cars}
        onAdd={() => {
          setEditing(undefined);
          setView("add");
        }}
        onEdit={(car) => {
          setEditing(car);
          setView("add");
        }}
        onChanged={load}
        onClose={onClose}
      />
    </Modal>
  );
}

/** Значок гаража в шапці: відкриває вікно зі збереженими авто */
export function GarageButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Гараж"
        onClick={() => setOpen(true)}
        className="relative flex shrink-0 cursor-pointer items-center justify-center p-1 transition-opacity hover:opacity-80"
      >
        <ShopIcon name="garage" size={36} className="size-9" />
      </button>
      {open && <GarageModal onClose={() => setOpen(false)} />}
    </>
  );
}

/** Вікно додавання чи редагування авто для сторінки «Мої авто» в кабінеті */
export function CarEditorModal({
  car,
  onClose,
  onSaved,
}: {
  car?: UserCar;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Modal
      title={car ? "Редагувати авто" : "Додати авто"}
      compact
      onClose={onClose}
    >
      <AddCarForm
        car={car}
        onSaved={() => {
          onSaved();
          onClose();
        }}
        onBack={onClose}
      />
    </Modal>
  );
}
