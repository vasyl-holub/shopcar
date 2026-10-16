import { gql } from "@/lib/api/graphql";

export type CurrencyRate = {
  id: string;
  symbol: string;
  value: number;
};

type Response = {
  currencyAll: {
    edges: {
      id: string;
      name: string | null;
      symbol: string | null;
      userValue: number | null;
    }[];
  };
};

const CURRENCIES = /* GraphQL */ `
  query Currencies {
    currencyAll {
      edges {
        id
        name
        symbol
        userValue
      }
    }
  }
`;

/**
 * Курси валют до гривні для шапки. Гривню (значення 1) не показуємо.
 * Порожній масив, якщо API недоступний.
 */
export async function getCurrencyRates(): Promise<CurrencyRate[]> {
  try {
    const data = await gql<Response>(CURRENCIES, {
      revalidate: 60 * 30,
      tags: ["currencies"],
    });

    return data.currencyAll.edges
      .filter((c) => c.symbol && c.userValue && c.userValue !== 1)
      .map((c) => ({ id: c.id, symbol: c.symbol!, value: c.userValue! }));
  } catch {
    return [];
  }
}
