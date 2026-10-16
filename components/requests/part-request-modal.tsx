"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import {
  UnderlineField,
  UnderlineSelect,
  UnderlineTextarea,
} from "@/components/checkout/checkout-fields";
import { Modal } from "@/components/ui/modal";
import { buttonClasses } from "@/components/ui/button";
import {
  createRequestAction,
  type RequestFormState,
} from "@/app/requests/actions";
import { requestOptionsAction } from "@/app/requests/options-action";
import type { RequestFormOptions } from "@/lib/api/catalog";

const EMPTY: RequestFormOptions = {
  brands: [],
  bodies: [],
  transmissions: [],
  drives: [],
};

/** Вміст вікна: заголовок, поля за макетом і кнопка «ЗРОБИТИ ЗАПИТ» */
function RequestForm({ options }: { options: RequestFormOptions }) {
  const [state, action, pending] = useActionState<RequestFormState, FormData>(
    createRequestAction,
    {},
  );
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  const [brand, setBrand] = useState(v.brand ?? "");
  const [body, setBody] = useState(v.body ?? "");
  const [transmission, setTransmission] = useState(v.transmission ?? "");
  const [drive, setDrive] = useState(v.drive ?? "");

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center text-[#121212]">
        <CircleCheck aria-hidden className="size-12 text-shop-green" />
        <p className="text-[18px] font-semibold leading-[1.2]">
          Запит надіслано
        </p>
        <p className="max-w-[420px] text-[14px] leading-[1.4] text-muted">
          Менеджер підбере деталь і зв’яжеться з вами. Зазвичай це займає від
          кількох хвилин до години в робочий час.
        </p>
        <Link href="/account" className={buttonClasses({ className: "mt-2" })}>
          Мої запити
        </Link>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-[30px]">
      {state.formError && (
        <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
          {state.formError}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <UnderlineSelect
          name="brand"
          label="Марка"
          required
          searchable
          value={brand}
          onChange={setBrand}
          options={options.brands.map((b) => ({ value: b.id, label: b.name }))}
          error={e.brand}
        />
        <UnderlineField
          id="pr-model"
          name="model"
          label="Модель"
          required
          defaultValue={v.model}
          error={e.model}
        />
        <UnderlineField
          id="pr-modification"
          name="modification"
          label="Модифікація"
          required
          defaultValue={v.modification}
          error={e.modification}
        />
        <UnderlineField
          id="pr-year"
          name="year"
          label="Початок випуску"
          required
          defaultValue={v.year}
          error={e.year}
        />
        <UnderlineField
          id="pr-vin"
          name="vin"
          label="VIN"
          defaultValue={v.vin}
          error={e.vin}
        />
        <UnderlineField
          id="pr-litres"
          name="litres"
          label="Об'єм двигуна"
          required
          defaultValue={v.litres}
          error={e.litres}
        />
        <UnderlineSelect
          name="body"
          label="Кузов"
          value={body}
          onChange={setBody}
          options={options.bodies}
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
        <UnderlineTextarea
          id="pr-description"
          name="description"
          label="Опис потрібної запчастини"
          required
          height="h-[150px]"
          defaultValue={v.description}
          error={e.description}
        />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({
            className: "w-full cursor-pointer uppercase lg:w-[240px]",
          })}
        >
          {pending ? "Надсилаємо…" : "Зробити запит"}
        </button>
      </div>
    </form>
  );
}

function RequestModal({ onClose }: { onClose: () => void }) {
  const [options, setOptions] = useState<RequestFormOptions>(EMPTY);

  useEffect(() => {
    let alive = true;
    requestOptionsAction().then((o) => alive && setOptions(o));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Modal title="підбір деталі" onClose={onClose}>
      <RequestForm options={options} />
    </Modal>
  );
}

/** Кнопка шапки «ПІДБЕРІТЬ МЕНІ ДЕТАЛЬ»: відкриває вікно з формою запиту */
export function PartRequestButton({
  className,
  onOpen,
  children,
}: {
  className?: string;
  /** Додаткова дія при відкритті, напр. закрити мобільне меню */
  onOpen?: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>
      {open && <RequestModal onClose={() => setOpen(false)} />}
    </>
  );
}
