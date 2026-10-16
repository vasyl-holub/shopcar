"use client";

import { useState } from "react";
import { UnderlineSelect } from "@/components/checkout/checkout-fields";

/** Список-фільтр у рамці для GET-форми: значення йде у приховане поле `name` */
export function ReturnFilterSelect({
  name,
  label,
  options,
  initial,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <UnderlineSelect
      box
      name={name}
      label={label}
      value={value}
      onChange={setValue}
      options={[{ value: "", label: "Усі" }, ...options]}
    />
  );
}
