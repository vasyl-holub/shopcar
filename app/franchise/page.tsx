import type { Metadata } from "next";
import { FranchiseIntro } from "@/components/franchise/intro";
import { FranchiseBenefits } from "@/components/franchise/benefits";
import { FranchiseFormats } from "@/components/franchise/formats";
import { FranchiseFinance } from "@/components/franchise/finance";
import { FranchiseSupport } from "@/components/franchise/support";
import { FranchiseSteps } from "@/components/franchise/steps";
import { FranchiseCta } from "@/components/franchise/cta";

export const metadata: Metadata = {
  title: "Франшиза магазину автозапчастин WestPart",
  description:
    "Відкрийте магазин автозапчастин за готовою моделлю: три формати, налагоджена логістика з Польщі, клієнтська база регіону та підтримка центрального офісу.",
};

export default function FranchisePage() {
  return (
    <>
      <FranchiseIntro />
      <FranchiseBenefits />
      <FranchiseFormats />
      <FranchiseFinance />
      <FranchiseSupport />
      <FranchiseSteps />
      <FranchiseCta />
    </>
  );
}
