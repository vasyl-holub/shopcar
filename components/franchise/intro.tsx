import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const facts = [
  { value: "з 2010", label: "року на ринку автозапчастин" },
  { value: "20 000+", label: "клієнтів у базі, з них 500+ гуртових" },
  { value: "4 000 грн", label: "середній чек" },
  { value: "2 місяці", label: "від договору до відкриття" },
];

export function FranchiseIntro() {
  return (
    <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
      <Container>
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Франшиза" }]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-300 px-2.5 text-[14px] leading-[1.5] text-blue-300">
              Франшиза
            </span>

            <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              Магазин автозапчастин за готовою моделлю
            </h1>

            <div className="flex flex-col gap-3 text-pretty text-[16px] leading-[1.6] text-grey-700">
              <p>
                Понад 80% автомобілів в Україні — імпортовані вживані, і майже
                три чверті з них випущені до 2010 року. Оригінальні запчастини
                для таких авто часто зняті з виробництва або надто дорогі — тому
                попит на якісні аналоги стабільний.
              </p>
              <p>
                Ми офіційний представник Polcar в Україні, перший
                інтернет-магазин автозапчастин на заході країни й у трійці
                лідерів по Україні. Франчайзі отримує відпрацьовані процеси,
                логістику й асортимент.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3 self-start sm:gap-4">
            {facts.map((f) => (
              <li
                key={f.label}
                className="flex flex-col gap-1 rounded-[16px] border border-grey-200 bg-white p-5"
              >
                <span className="text-[20px] font-semibold leading-[1.3] text-blue-300 lg:text-[24px]">
                  {f.value}
                </span>
                <span className="text-[13px] leading-[1.45] text-grey-700">
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
