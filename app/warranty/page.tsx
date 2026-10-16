import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import { WarrantyIntro } from "@/components/warranty/intro";
import { WarrantyGuarantee } from "@/components/warranty/guarantee";
import { WarrantySelection } from "@/components/warranty/selection";
import { WarrantyReturns } from "@/components/warranty/returns";
import { WarrantyExclusions } from "@/components/warranty/exclusions";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "garantiya-povernennya" */
  const meta = await cmsMetadata("garantiya-povernennya", {
    title: "Гарантія та повернення автозапчастин",
    description:
      "Офіційна гарантія 12 місяців на Polcar, NTY та Signeda, умови гарантійного розгляду, відповідальність за підбір деталі та правила повернення товару протягом 14 днів.",
  });

  return meta;
}

export default function WarrantyPage() {
  return (
    <>
      <WarrantyIntro />
      <WarrantyGuarantee />
      <WarrantySelection />
      <WarrantyReturns />
      <WarrantyExclusions />
    </>
  );
}
