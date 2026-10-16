"use client";

import {
  BoxIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { ContactMenu } from "@/components/layout/contact-menu";
import { RegionSelect } from "@/components/layout/region-select";
import { carriers, pickupByRegion } from "@/lib/pickup-points";
import { setRegion, useRegion } from "@/lib/region-store";

function Item({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof BoxIcon;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Icon className="size-5 shrink-0 text-blue-300" />
      <p className="whitespace-nowrap text-[14px] leading-[1.5] text-grey-700">
        {label}: <span className="font-semibold text-black-900">{value}</span>
      </p>
    </div>
  );
}

/**
 * Вміст службової смуги: вибір області й те, що від нього залежить.
 *
 * Поки область не вибрана, смуга про неї й питає — пункт видачі не
 * показуємо, бо він у різних областях різний, а в більшості їх немає
 * зовсім.
 */
export function RegionStrip({ regions }: { regions: string[] }) {
  const region = useRegion();
  const pickup = region ? pickupByRegion[region] : undefined;

  return (
    <div className="flex w-full items-center justify-between gap-x-8">
      <div className="flex items-center gap-2">
        <MapPinIcon className="size-5 shrink-0 text-blue-300" />
        <p className="whitespace-nowrap text-[14px] leading-[1.5] text-grey-700">
          Ваша область:
        </p>
        <RegionSelect
          regions={regions}
          value={region}
          onChange={setRegion}
          placeholder="—"
        />
      </div>

      <div className="flex items-center gap-8">
        {pickup ? (
          <>
            <Item icon={BoxIcon} label="Пункт видачі" value={pickup.address} />
            {/* Графік поступається місцем, коли його бракує: він є у футері
                й на сторінці контактів, а номер телефону — ні */}
            <Item
              icon={ClockIcon}
              label="Графік"
              value={pickup.hours}
              className="hidden xl:flex"
            />
          </>
        ) : (
          /* Своєї точки немає або область ще не вибрана — у будь-якому
             разі правда одна: туди возять перевізники. Смуга при цьому
             не стоїть напівпорожньою */
          <Item icon={TruckIcon} label="Доставка" value={carriers} />
        )}

        <ContactMenu />
      </div>
    </div>
  );
}
