import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import { CooperationIntro } from "@/components/cooperation/intro";
import { CooperationAudience } from "@/components/cooperation/audience";
import { CooperationWholesale } from "@/components/cooperation/wholesale";
import { CooperationDropshipping } from "@/components/cooperation/dropshipping";
import { CooperationPickup } from "@/components/cooperation/pickup";
import { CooperationStart } from "@/components/cooperation/start";
import { CooperationCta } from "@/components/cooperation/cta";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "cooperation" */
  const meta = await cmsMetadata("cooperation", {
    title: "Співпраця — оптові умови, дропшипінг, партнерська програма",
    description:
      "Три формати роботи з WestPart: оптові B2B-рівні цін, дропшипінг без власного складу та партнерський пункт видачі. Реєстрація в B2B-кабінеті та стартовий рівень B2B Start.",
  });

  return meta;
}

/**
 * Сторінка об'єднує три сторінки старого сайту: «Партнерська програма»,
 * «Дропшипінг» і «Оптові умови» — по окремому блоку на кожен формат.
 */
export default function CooperationPage() {
  return (
    <>
      <CooperationIntro />
      <CooperationAudience />
      <CooperationWholesale />
      <CooperationDropshipping />
      <CooperationPickup />
      <CooperationStart />
      <CooperationCta />
    </>
  );
}
