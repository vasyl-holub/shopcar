import { gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import type { ApiFieldError } from "@/lib/api/auth";

/* ------------------------------------------ Неоплачені замовлення */

export type UnpaidOrder = {
  id: string;
  number: number | null;
  total: number | null;
  created: string;
};

/**
 * Беремо готове поле `unpaidOrders` у користувача, а не фільтр
 * `orderAll(isPaid:false)`: бекенд уже рахує його сам і не тягне
 * усю решту даних замовлення.
 */
export async function getUnpaidOrders(): Promise<UnpaidOrder[]> {
  const auth = await getApiAuth();
  if (!auth) return [];

  try {
    const data = await gql<{
      user: { unpaidOrders: UnpaidOrder[] | null } | null;
    }>(
      /* GraphQL */ `
        query UnpaidOrders {
          user {
            unpaidOrders {
              id
              number
              total
              created
            }
          }
        }
      `,
      { auth },
    );
    return data.user?.unpaidOrders ?? [];
  } catch {
    return [];
  }
}

/* ------------------------------------------ Сповіщення про оплату */

export type PaymentNotice = {
  id: string;
  number: number | null;
  created: string;
  date: string | null;
  value: string | null;
  comment: string;
  payMethodName: string | null;
  /** Менеджер підтвердив, що гроші зайшли */
  isReady: boolean;
  response: string | null;
  orderNumbers: number[];
};

const NOTICES = /* GraphQL */ `
  query PaymentNotices($page: Int!, $perPage: Int!) {
    paymentNotifyAll(page: $page, perPage: $perPage) {
      totalCount
      pagesCount
      edges {
        id
        number
        created
        date
        value
        comment
        isReady
        response
        payMethod {
          name
        }
        orders {
          edges {
            number
          }
        }
      }
    }
  }
`;

export type PaymentNoticesPage = {
  items: PaymentNotice[];
  totalCount: number;
  pagesCount: number;
};

const EMPTY: PaymentNoticesPage = { items: [], totalCount: 0, pagesCount: 0 };

export async function getPaymentNotices(
  page = 1,
  perPage = 10,
): Promise<PaymentNoticesPage> {
  const auth = await getApiAuth();
  if (!auth) return EMPTY;

  try {
    const data = await gql<{
      paymentNotifyAll: {
        totalCount: number | null;
        pagesCount: number | null;
        edges: {
          id: string;
          number: number | null;
          created: string;
          date: string | null;
          value: string | null;
          comment: string | null;
          isReady: boolean | null;
          response: string | null;
          payMethod: { name: string | null } | null;
          orders: { edges: { number: number | null }[] } | null;
        }[];
      } | null;
    }>(NOTICES, { auth, variables: { page, perPage } });

    const conn = data.paymentNotifyAll;
    if (!conn) return EMPTY;

    return {
      items: conn.edges.map((n) => ({
        id: n.id,
        number: n.number,
        created: n.created,
        date: n.date,
        value: n.value,
        comment: n.comment ?? "",
        payMethodName: n.payMethod?.name ?? null,
        isReady: Boolean(n.isReady),
        response: n.response,
        orderNumbers: (n.orders?.edges ?? [])
          .map((o) => o.number)
          .filter((x): x is number => typeof x === "number"),
      })),
      totalCount: conn.totalCount ?? 0,
      pagesCount: conn.pagesCount ?? 0,
    };
  } catch {
    return EMPTY;
  }
}

export async function notifyAboutPayment(input: {
  date: string;
  payMethod: string;
  value: string;
  currency?: string;
  orders?: string[];
  comment?: string;
}) {
  const auth = await getApiAuth();
  return gqlRaw<{ notifyAboutPayment: { errors: ApiFieldError[] | null } }>(
    /* GraphQL */ `
      mutation NotifyAboutPayment($input: NotifyAboutPaymentMutationInput!) {
        notifyAboutPayment(input: $input) {
          errors {
            field
            messages
          }
        }
      }
    `,
    { auth, variables: { input } },
  );
}

/** Валюти для поля «Валюта»; «грн.» бекенд віддає як звичайну валюту */
export async function getPaymentCurrencies(): Promise<
  { id: string; symbol: string }[]
> {
  try {
    const data = await gql<{
      currencyAll: { edges: { id: string; symbol: string | null }[] };
    }>(
      /* GraphQL */ `
        query PaymentCurrencies {
          currencyAll {
            edges {
              id
              symbol
            }
          }
        }
      `,
      { revalidate: 60 * 60 * 24, tags: ["currencies"] },
    );
    return data.currencyAll.edges
      .filter((c) => c.symbol)
      .map((c) => ({ id: c.id, symbol: c.symbol! }));
  } catch {
    return [];
  }
}
