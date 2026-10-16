import Link from "next/link";
import {
  CartIcon,
  SearchIcon,
  TargetArrowIcon,
  TruckIcon,
} from "@/components/ui/icons";

const hints = [
  { icon: SearchIcon, text: "Пошук за номером, OEM або VIN" },
  { icon: TruckIcon, text: "Доставка по всій Україні за 2–4 дні" },
  { icon: TargetArrowIcon, text: "Не знайшли — підберемо вручну" },
];

export function EmptyCart() {
  return (
    /* Без рамки й фону: вміст вузький і центрований, тому картка навколо
       нього нічого не групувала — лише додавала порожніх полів з боків */
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-6 pb-10 pt-2 sm:pb-14 sm:pt-4">
      <span className="inline-flex size-20 items-center justify-center rounded-full bg-blue-25 text-blue-300">
        <CartIcon className="size-9" />
      </span>

      <div className="flex max-w-[460px] flex-col gap-2 text-center">
        <h2 className="text-[22px] font-semibold leading-[1.4] text-black-900 sm:text-[26px]">
          У кошику поки порожньо
        </h2>
        <p className="text-[16px] leading-[1.5] text-grey-700">
          Введіть номер деталі, OEM-код або VIN — і ми покажемо ціну, наявність
          та строк поставки.
        </p>
      </div>

      {/* Пошук одразу в блоці: для нашої аудиторії це головна дія,
          і вести людину на іншу сторінку заради нього — зайвий крок */}
      <form
        action="/search"
        role="search"
        className="flex h-14 w-full max-w-[520px] items-center overflow-hidden rounded-[8px] border border-grey-300 bg-white"
      >
        <input
          name="q"
          type="search"
          autoComplete="off"
          spellCheck={false}
          aria-label="Номер деталі, OEM-код або VIN"
          placeholder="Номер деталі, OEM-код або VIN"
          className="h-full min-w-0 flex-1 bg-transparent px-5 text-[16px] leading-[1.5] text-black-900 placeholder:text-grey-600 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Знайти"
          className="flex aspect-square h-full shrink-0 items-center justify-center bg-blue-300 text-white transition-colors hover:bg-orange-hover"
        >
          <SearchIcon className="size-6" />
        </button>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/catalog"
          className="inline-flex h-12 items-center justify-center rounded-[8px] border border-blue-300 bg-white px-5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-300 hover:text-white"
        >
          Перейти в каталог
        </Link>
        <Link
          href="/requests/create"
          className="inline-flex h-12 items-center justify-center rounded-[8px] px-5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
        >
          Залишити заявку на підбір
        </Link>
      </div>

      {/* У стовпчик, а не в рядок: три підказки не вміщаються в ширину
          блоку й розпадаються на «два плюс один» — це читається як збій */}
      <ul className="mt-2 flex w-full flex-col items-center gap-3 border-t border-grey-200 pt-6">
        {hints.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-center gap-2 text-[14px] leading-[1.5] text-grey-700"
          >
            <Icon className="size-5 shrink-0 text-blue-300" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
