import { gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";

export type StatementRow = {
  id: string;
  number: number;
  date: string;
  /** Назва операції українською, без хвоста «, orders: …» */
  operation: string;
  /** Сума операції зі знаком: плюс — надходження, мінус — списання */
  amount: number;
  orders: number[];
  balance: string;
  /** Шляхи до друкованої форми й експорту на боці бекенду (потрібна сесія) */
  printPath: string | null;
  csvPath: string | null;
};

export type StatementsPage = {
  rows: StatementRow[];
  totalCount: number;
  pagesCount: number;
};

const EMPTY: StatementsPage = { rows: [], totalCount: 0, pagesCount: 0 };

const QUERY = /* GraphQL */ `
  query Statements($start: Date, $end: Date, $page: Int, $perPage: Int) {
    accountAll(
      between: { start: $start, end: $end }
      page: $page
      perPage: $perPage
    ) {
      totalCount
      pagesCount
      edges {
        id
        type
        date
        sourceValue
        number
        orders
        balance
        printUrl
        csvUrl
      }
    }
  }
`;

/** Бекенд пише назви операцій російською: перекладаємо відомі, решту лишаємо */
const OPERATIONS: [RegExp, string][] = [
  [/Отправка заказа клиенту/i, "Відправлення замовлення клієнту"],
  [/Клиент пополнил баланс/i, "Клієнт поповнив баланс"],
  [/Возврат/i, "Повернення"],
  [/Корректировка/i, "Коригування"],
];

function operationName(raw: string) {
  const text = raw.replace(/,?\s*orders:.*$/i, "").trim();
  return OPERATIONS.find(([re]) => re.test(text))?.[1] ?? text;
}

/** Виписка по рахунку клієнта за період (дати у форматі РРРР-ММ-ДД) */
export async function getStatements(opts: {
  from?: string;
  to?: string;
  page: number;
  perPage: number;
}): Promise<StatementsPage> {
  const auth = await getApiAuth();
  if (!auth) return EMPTY;

  try {
    const data = await gql<{
      accountAll: {
        totalCount: number | null;
        pagesCount: number | null;
        edges: {
          id: string;
          type: string | null;
          date: string;
          sourceValue: string | null;
          number: number;
          orders: number[] | null;
          balance: string | null;
          printUrl: string | null;
          csvUrl: string | null;
        }[];
      } | null;
    }>(QUERY, {
      auth,
      variables: {
        /* Діапазон обов'язковий: без дат беремо весь час */
        start: opts.from || "2000-01-01",
        end: opts.to || "2100-01-01",
        page: opts.page,
        perPage: opts.perPage,
      },
    });
    const conn = data.accountAll;
    if (!conn) return EMPTY;
    return {
      rows: conn.edges.map((e) => ({
        id: e.id,
        number: e.number,
        date: e.date,
        operation: operationName(e.type ?? ""),
        amount: Number(e.sourceValue ?? 0),
        orders: e.orders ?? [],
        balance: e.balance ?? "",
        printPath: e.printUrl,
        csvPath: e.csvUrl,
      })),
      totalCount: conn.totalCount ?? 0,
      pagesCount: conn.pagesCount ?? 0,
    };
  } catch {
    return EMPTY;
  }
}
