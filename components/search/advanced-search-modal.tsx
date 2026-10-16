"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UnderlineField,
  UnderlineSelect,
} from "@/components/checkout/checkout-fields";
import { Modal } from "@/components/ui/modal";
import { buttonClasses } from "@/components/ui/button";
import { advancedSearchOptionsAction } from "@/app/search/options-action";
import type { Choice } from "@/lib/api/delivery";

const TYPES: Choice[] = [
  { value: "exact", label: "Точний збіг" },
  { value: "starts", label: "Починається з" },
  { value: "part", label: "Частина номеру" },
];

/** Поля, з яких складається адреса пошуку, і їхні підписи у вікні */
const FIELDS = [
  { name: "num", label: "Номер" },
  { name: "cross", label: "Крос-номер" },
  { name: "brand", label: "Виробник" },
  { name: "name", label: "Назва" },
  { name: "ean", label: "EAN код" },
] as const;

function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [type, setType] = useState("exact");
  const [slug, setSlug] = useState("");
  const [catalogs, setCatalogs] = useState<Choice[]>([]);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let alive = true;
    advancedSearchOptionsAction().then((c) => alive && setCatalogs(c));
    return () => {
      alive = false;
    };
  }, []);

  const submit = (data: FormData) => {
    const query = new URLSearchParams();
    for (const { name } of FIELDS) {
      const value = String(data.get(name) ?? "").trim();
      if (value) query.set(name, value);
    }
    if ([...query].length === 0) {
      setError("Вкажіть хоча б одне поле для пошуку");
      return;
    }
    if (slug) query.set("slug", slug);
    if (type !== "exact") query.set("type", type);
    onClose();
    router.push(`/catalog-search?${query.toString()}`);
  };

  return (
    <Modal title="Розширений пошук" onClose={onClose}>
      <form action={submit} className="flex flex-col gap-[30px]">
        <div className="flex flex-col gap-5">
          <UnderlineSelect
            name="type"
            label="Тип пошуку"
            value={type}
            onChange={setType}
            options={TYPES}
          />
          {FIELDS.map((f) => (
            <UnderlineField
              key={f.name}
              id={`as-${f.name}`}
              name={f.name}
              label={f.label}
            />
          ))}
          <UnderlineSelect
            name="catalog"
            label="Каталог"
            searchable
            value={slug}
            onChange={setSlug}
            options={catalogs}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-center text-[14px] leading-[1.4] text-danger-700"
          >
            {error}
          </p>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            className={buttonClasses({
              className: "w-full cursor-pointer uppercase lg:w-[240px]",
            })}
          >
            Пошук
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** Кнопка шапки «РОЗШИРЕНИЙ ПОШУК»: відкриває вікно з полями пошуку */
export function AdvancedSearchButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <SearchModal onClose={() => setOpen(false)} />}
    </>
  );
}
