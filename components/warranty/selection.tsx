import { Container } from "@/components/ui/container";
import {
  CircleCheckIcon,
  HeadsetIcon,
  TargetArrowIcon,
} from "@/components/ui/icons";

const managerTerms = [
  "Ви надали повні й достовірні дані",
  "Комплектація авто не змінювалась",
  "Підбір підтверджений у замовленні або переписці",
];

export function WarrantySelection() {
  return (
    <section className="bg-blue-25 py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[680px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Хто відповідає за підбір
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Це найчастіше питання при обміні. Відповідь залежить від того, хто
            саме обирав деталь.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-[20px] border border-grey-200 bg-white p-6">
            <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-blue-25 text-blue-300">
              <TargetArrowIcon className="size-7" />
            </span>
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              Підбір робили ви
            </h3>
            <p className="text-[15px] leading-[1.55] text-grey-700">
              Якщо деталь обрана самостійно — через каталог, VIN або артикул —
              відповідальність за правильність вибору лежить на покупцеві.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-[20px] border border-green-300/25 bg-white p-6">
            <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-green-50 text-green-300">
              <HeadsetIcon className="size-7" />
            </span>
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              Підбір робив менеджер
            </h3>
            <p className="text-[15px] leading-[1.55] text-grey-700">
              Якщо деталь підбирав менеджер за вашими даними — VIN, параметри
              авто, фото, номер кузова — відповідальність за коректність несе
              компанія. Помилку виправляємо за свій рахунок.
            </p>

            <ul className="flex flex-col gap-2 border-t border-grey-200 pt-4">
              {managerTerms.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2 text-[14px] leading-[1.5] text-black-900"
                >
                  <CircleCheckIcon className="mt-0.5 size-5 shrink-0 text-green-300" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
