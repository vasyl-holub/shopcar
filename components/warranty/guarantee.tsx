import { Container } from "@/components/ui/container";
import { CircleCheckIcon } from "@/components/ui/icons";

const conditions = [
  "Деталь встановлена на СТО",
  "Є акт виконаних робіт",
  "Немає механічних пошкоджень",
  "Дотримані технічні вимоги виробника",
];

export function WarrantyGuarantee() {
  return (
    <section className="py-12 lg:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="flex max-w-[520px] flex-col gap-3">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
              Гарантія 12 місяців
            </h2>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Офіційна гарантія виробника на продукцію Polcar, NTY та Signeda.
              Строк рахується з моменту відвантаження товару.
            </p>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Рішення приймається на підставі офіційного висновку виробника або
              сервісного центру.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 rounded-[20px] border border-grey-200 p-6">
              <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                Коли звернення розглядається
              </h3>
              <ul className="flex flex-col gap-3">
                {conditions.map((c) => (
                  <li
                    key={c}
                    className="flex items-center gap-3 text-[16px] leading-[1.5] text-black-900"
                  >
                    <CircleCheckIcon className="size-6 shrink-0 text-green-300" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2 rounded-[16px] bg-blue-25 p-6">
              <h3 className="text-[16px] font-semibold leading-[1.4] text-black-900">
                Якщо випадок визнано гарантійним
              </h3>
              <p className="text-[15px] leading-[1.55] text-grey-700">
                Міняємо товар або компенсуємо його вартість. Витрати на
                пересилання до моменту підтвердження гарантії несе покупець.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
