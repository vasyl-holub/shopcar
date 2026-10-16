import { backendUrl, gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import type { ApiFieldError } from "@/lib/api/auth";

/* --------------------------------------------------------- Статуси */

/**
 * Довідники статусів — це GenericScalar, тобто звичайний словник
 * «код → назва». Доступні анонімно, тож кешуємо надовго.
 */
const STATUSES = /* GraphQL */ `
  query OrderStatuses {
    orderStatuses
    orderItemStatuses
  }
`;

export type StatusMap = Record<string, string>;

export async function getOrderStatuses() {
  try {
    const data = await gql<{
      orderStatuses: StatusMap | null;
      orderItemStatuses: StatusMap | null;
    }>(STATUSES, { revalidate: 60 * 60 * 24, tags: ["order-statuses"] });
    return {
      order: data.orderStatuses ?? {},
      item: data.orderItemStatuses ?? {},
    };
  } catch {
    return { order: {}, item: {} };
  }
}

/**
 * Тон плашки за змістом статусу, а не за номером: коди не впорядковані
 * (12 «опрацьовується» логічно стоїть між 1 і 2).
 */
export type StatusTone = "neutral" | "progress" | "waiting" | "done" | "failed";

const ORDER_TONES: Record<string, StatusTone> = {
  "1": "neutral", // нове
  "2": "progress", // підтверджено
  "12": "progress", // опрацьовується
  "5": "waiting", // очікує поставку
  "6": "waiting", // очікує оплату
  "11": "waiting", // відкладено
  "8": "progress", // готове до відправлення
  "9": "progress", // запаковано
  "10": "progress", // відправлено
  "3": "done", // завершено
  "4": "failed", // скасовано
};

const ITEM_TONES: Record<string, StatusTone> = {
  "1": "neutral",
  "10": "progress",
  "2": "done",
  "5": "progress",
  "4": "progress",
  "11": "progress",
  "12": "progress",
  "13": "progress",
  "8": "progress",
  "6": "waiting",
  "7": "failed",
  "3": "failed",
  "9": "failed",
};

export function orderTone(status: number | null): StatusTone {
  return ORDER_TONES[String(status)] ?? "neutral";
}

export function itemTone(status: number | null): StatusTone {
  return ITEM_TONES[String(status)] ?? "neutral";
}

/* ------------------------------------------------------ Замовлення */

export type OrderComment = {
  id: string;
  text: string;
  created: string;
  /** Хто написав: «Ви» або магазин */
  author: string;
  /** Коментар самого клієнта — у списку виглядає інакше */
  own: boolean;
};

/**
 * Види коментарів до замовлення. Перевірено на живих даних кабінету:
 *   1 — написав сам клієнт: примітка при оформленні або звернення звідси;
 *   2 — повідомлення магазину клієнту («Доставка затримується…»);
 *   3 — службова помітка менеджера: скорочення на кшталт «б», «пз»,
 *       «не було з сігнеди» і системні рядки «Web замовлення».
 *
 * Клієнту показуємо лише перші два. Решту ховаємо за замовчуванням, а не
 * виключаємо третій: якщо на бекенді зʼявиться новий службовий вид, він
 * не протече в кабінет сам собою.
 */
const COMMENT_FROM_CLIENT = 1;
const COMMENT_FROM_SHOP = 2;

type RawComment = {
  id: string;
  type: number | null;
  text: string | null;
  created: string;
  manager: { fullName: string | null } | null;
};

function visibleComments(edges: RawComment[] | undefined | null) {
  return (edges ?? [])
    .filter(
      (c) =>
        c.text?.trim() &&
        (c.type === COMMENT_FROM_CLIENT || c.type === COMMENT_FROM_SHOP),
    )
    .map((c) => ({
      id: c.id,
      text: c.text!.trim(),
      created: c.created,
      author:
        c.type === COMMENT_FROM_CLIENT
          ? "Ви"
          : (c.manager?.fullName ?? "WestPart"),
      own: c.type === COMMENT_FROM_CLIENT,
    }));
}

/** Шматок запиту однаковий і для списку, і для картки замовлення */
const COMMENT_FIELDS = /* GraphQL */ `
  comments {
    edges {
      id
      type
      text
      created
      manager {
        fullName
      }
    }
  }
`;

export type OrderListItem = {
  id: string;
  number: number | null;
  created: string;
  status: number | null;
  total: number | null;
  isPaid: boolean;
  shipped: string | null;
  deliveryDeclaration: string;
  itemsCount: number;
  /** Лише ті коментарі, які клієнту можна бачити */
  comments: OrderComment[];
};

type OrderAllResponse = {
  orderAll: {
    pagesCount: number | null;
    totalCount: number | null;
    totalSum: number | null;
    completedCount: number | null;
    canceledCount: number | null;
    edges: {
      id: string;
      number: number | null;
      created: string;
      status: number | null;
      total: number | null;
      isPaid: boolean;
      shipped: string | null;
      deliveryDeclaration: string;
      items: { totalCount: number | null } | null;
      comments: { edges: RawComment[] } | null;
    }[];
  } | null;
};

const ORDER_LIST = /* GraphQL */ `
  query Orders($page: Int!, $perPage: Int!, $statuses: [String]) {
    orderAll(
      page: $page
      perPage: $perPage
      statuses: $statuses
      sort: "-created"
    ) {
      pagesCount
      totalCount
      totalSum
      completedCount
      canceledCount
      edges {
        id
        number
        created
        status
        total
        isPaid
        shipped
        deliveryDeclaration
        items {
          totalCount
        }
        ${COMMENT_FIELDS}
      }
    }
  }
`;

export type OrdersPage = {
  items: OrderListItem[];
  pagesCount: number;
  totalCount: number;
  totalSum: number;
  completedCount: number;
  canceledCount: number;
};

const EMPTY_PAGE: OrdersPage = {
  items: [],
  pagesCount: 0,
  totalCount: 0,
  totalSum: 0,
  completedCount: 0,
  canceledCount: 0,
};

/**
 * perPage без page бекенд мовчки ігнорує — передаємо завжди обидва.
 */
export async function getOrders(
  page = 1,
  perPage = 10,
  statuses?: string[],
): Promise<OrdersPage> {
  const auth = await getApiAuth();
  if (!auth) return EMPTY_PAGE;

  try {
    const data = await gql<OrderAllResponse>(ORDER_LIST, {
      auth,
      variables: {
        page,
        perPage,
        ...(statuses?.length ? { statuses } : {}),
      },
    });

    const conn = data.orderAll;
    if (!conn) return EMPTY_PAGE;

    return {
      items: conn.edges.map((o) => ({
        id: o.id,
        number: o.number,
        created: o.created,
        status: o.status,
        total: o.total,
        isPaid: o.isPaid,
        shipped: o.shipped,
        deliveryDeclaration: o.deliveryDeclaration,
        itemsCount: o.items?.totalCount ?? 0,
        comments: visibleComments(o.comments?.edges),
      })),
      pagesCount: conn.pagesCount ?? 0,
      totalCount: conn.totalCount ?? 0,
      totalSum: conn.totalSum ?? 0,
      completedCount: conn.completedCount ?? 0,
      canceledCount: conn.canceledCount ?? 0,
    };
  } catch {
    return EMPTY_PAGE;
  }
}

/* ------------------------------------------- Таблиця замовлень */

export type OrderRow = {
  id: string;
  number: number | null;
  created: string;
  shipped: string | null;
  status: number | null;
  isPaid: boolean;
  total: number | null;
  carrier: string;
  city: string;
  declaration: string;
  recipient: string;
  canBeCancelled: boolean;
  printPath: string | null;
  csvPath: string | null;
  comments: OrderComment[];
};

export type OrderFilters = {
  number?: string;
  createdFrom?: string;
  createdTo?: string;
  shippedFrom?: string;
  shippedTo?: string;
  part?: string;
  statuses?: string[];
  itemStatuses?: string[];
  manufacturer?: string;
};

const ORDER_TABLE = /* GraphQL */ `
  query OrderTable(
    $page: Int!
    $perPage: Int!
    $number: Decimal
    $created: DateRangeFieldInput
    $shipped: DateRangeFieldInput
    $part: String
    $statuses: [String]
    $itemStatuses: [String]
    $manufacturer: String
  ) {
    orderAll(
      page: $page
      perPage: $perPage
      number: $number
      createdDateRange: $created
      shippedDateRange: $shipped
      itemsProductNum: $part
      statuses: $statuses
      itemStatuses: $itemStatuses
      manufacturer: $manufacturer
      sort: "-created"
    ) {
      pagesCount
      totalCount
      edges {
        id
        number
        created
        shipped
        status
        isPaid
        total
        deliveryDeclaration
        recipient
        city
        canBeCancelled
        printUrl
        csvUrl
        delivery {
          name
        }
        ${COMMENT_FIELDS}
      }
    }
  }
`;

export type OrderTablePage = {
  rows: OrderRow[];
  pagesCount: number;
  totalCount: number;
};

export async function getOrderTable(
  page: number,
  perPage: number,
  f: OrderFilters = {},
): Promise<OrderTablePage> {
  const empty = { rows: [], pagesCount: 0, totalCount: 0 };
  const auth = await getApiAuth();
  if (!auth) return empty;

  const range = (from?: string, to?: string) =>
    from || to
      ? { start: from || "2000-01-01", end: to || "2100-01-01" }
      : undefined;

  try {
    const data = await gql<{
      orderAll: {
        pagesCount: number | null;
        totalCount: number | null;
        edges: {
          id: string;
          number: number | null;
          created: string;
          shipped: string | null;
          status: number | null;
          isPaid: boolean;
          total: number | null;
          deliveryDeclaration: string;
          recipient: string;
          city: string;
          canBeCancelled: boolean | null;
          printUrl: string | null;
          csvUrl: string | null;
          delivery: { name: string | null } | null;
          comments: { edges: RawComment[] } | null;
        }[];
      } | null;
    }>(ORDER_TABLE, {
      auth,
      variables: {
        page,
        perPage,
        number: f.number && /^\d+$/.test(f.number) ? f.number : undefined,
        created: range(f.createdFrom, f.createdTo),
        shipped: range(f.shippedFrom, f.shippedTo),
        part: f.part || undefined,
        statuses: f.statuses?.length ? f.statuses : undefined,
        itemStatuses: f.itemStatuses?.length ? f.itemStatuses : undefined,
        manufacturer: f.manufacturer || undefined,
      },
    });

    const conn = data.orderAll;
    if (!conn) return empty;
    return {
      rows: conn.edges.map((o) => ({
        id: o.id,
        number: o.number,
        created: o.created,
        shipped: o.shipped,
        status: o.status,
        isPaid: o.isPaid,
        total: o.total,
        carrier: o.delivery?.name ?? "",
        city: o.city,
        declaration: o.deliveryDeclaration,
        recipient: o.recipient,
        canBeCancelled: Boolean(o.canBeCancelled),
        printPath: o.printUrl,
        csvPath: o.csvUrl,
        comments: visibleComments(o.comments?.edges),
      })),
      pagesCount: conn.pagesCount ?? 0,
      totalCount: conn.totalCount ?? 0,
    };
  } catch {
    return empty;
  }
}

/** Виробники для фільтра: каталожні, за алфавітом */
export async function getManufacturerOptions(): Promise<string[]> {
  try {
    const data = await gql<{
      manufacturerAll: { edges: { name: string | null }[] } | null;
    }>(
      /* GraphQL */ `
        query ManufacturerOptions {
          manufacturerAll(page: 1, perPage: 200, isCatalog: true) {
            edges {
              name
            }
          }
        }
      `,
      { revalidate: 60 * 60 * 24, tags: ["manufacturer-options"] },
    );
    return (data.manufacturerAll?.edges ?? [])
      .map((m) => m.name)
      .filter((n): n is string => Boolean(n))
      .sort((a, b) => a.localeCompare(b, "uk"));
  } catch {
    return [];
  }
}

/* --------------------------------------------- Одне замовлення */

export type OrderItem = {
  id: string;
  status: number | null;
  count: number;
  price: number | null;
  total: number | null;
  deliveryDays: number;
  arrival: string | null;
  comment: string;
  canBeReturned: boolean;
  hasReturn: boolean;
  product: {
    id: string;
    slug: string;
    name: string;
    num: string;
    brand: string | null;
    images: string[];
  } | null;
};

export type OrderDetails = {
  id: string;
  number: number | null;
  created: string;
  status: number | null;
  total: number | null;
  deliveryCost: string;
  isPaid: boolean;
  shipped: string | null;
  deliveryDate: string | null;
  deliveryInfo: string;
  deliveryDeclaration: string;
  deliveryMessage: string | null;
  deliveryName: string | null;
  payMethodName: string | null;
  recipient: string;
  city: string;
  address: string;
  phone: string;
  canBeCancelled: boolean;
  canBeReturned: boolean;
  printUrl: string | null;
  checkUrl: string | null;
  comments: OrderComment[];
  items: OrderItem[];
};

const ORDER_ONE = /* GraphQL */ `
  query Order($id: ID!) {
    order(id: $id) {
      id
      number
      created
      status
      total
      deliveryCost
      isPaid
      shipped
      deliveryDate
      deliveryInfo
      deliveryDeclaration
      deliveryMessage
      delivery {
        name
      }
      payMethod {
        name
      }
      recipient
      city
      address
      phone
      canBeCancelled
      canBeReturned
      printUrl
      checkUrl
      ${COMMENT_FIELDS}
      items {
        edges {
          id
          status
          count
          price
          total
          deliveryDays
          arrival
          comment
          canBeReturned
          hasReturn
          product {
            id
            slug
            name
            num
            manufacturer {
              name
            }
            images
          }
        }
      }
    }
  }
`;

type OrderOneResponse = {
  order: {
    id: string;
    number: number | null;
    created: string;
    status: number | null;
    total: number | null;
    deliveryCost: string;
    isPaid: boolean;
    shipped: string | null;
    deliveryDate: string | null;
    deliveryInfo: string;
    deliveryDeclaration: string;
    deliveryMessage: string | null;
    delivery: { name: string } | null;
    payMethod: { name: string } | null;
    recipient: string;
    city: string;
    address: string;
    phone: string;
    canBeCancelled: boolean | null;
    canBeReturned: boolean | null;
    printUrl: string | null;
    checkUrl: string | null;
    comments: { edges: RawComment[] } | null;
    items: {
      edges: {
        id: string;
        status: number | null;
        count: number;
        price: number | null;
        total: number | null;
        deliveryDays: number;
        arrival: string | null;
        comment: string;
        canBeReturned: boolean | null;
        hasReturn: boolean | null;
        product: {
          id: string;
          slug: string;
          name: string;
          num: string;
          manufacturer: { name: string } | null;
          images: string[] | null;
        } | null;
      }[];
    } | null;
  } | null;
};

export async function getOrder(id: string): Promise<OrderDetails | null> {
  const auth = await getApiAuth();
  if (!auth) return null;

  try {
    const data = await gql<OrderOneResponse>(ORDER_ONE, {
      auth,
      variables: { id },
    });
    const o = data.order;
    if (!o) return null;

    return {
      id: o.id,
      number: o.number,
      created: o.created,
      status: o.status,
      total: o.total,
      deliveryCost: o.deliveryCost,
      isPaid: o.isPaid,
      shipped: o.shipped,
      deliveryDate: o.deliveryDate,
      deliveryInfo: o.deliveryInfo,
      deliveryDeclaration: o.deliveryDeclaration,
      deliveryMessage: o.deliveryMessage,
      deliveryName: o.delivery?.name ?? null,
      payMethodName: o.payMethod?.name ?? null,
      recipient: o.recipient,
      city: o.city,
      address: o.address,
      phone: o.phone,
      canBeCancelled: Boolean(o.canBeCancelled),
      canBeReturned: Boolean(o.canBeReturned),
      printUrl: backendUrl(o.printUrl),
      checkUrl: backendUrl(o.checkUrl),
      comments: visibleComments(o.comments?.edges),
      items: (o.items?.edges ?? []).map((i) => ({
        id: i.id,
        status: i.status,
        count: i.count,
        price: i.price,
        total: i.total,
        deliveryDays: i.deliveryDays,
        arrival: i.arrival,
        comment: i.comment,
        canBeReturned: Boolean(i.canBeReturned),
        hasReturn: Boolean(i.hasReturn),
        product: i.product
          ? {
              id: i.product.id,
              slug: i.product.slug,
              name: i.product.name,
              num: i.product.num,
              brand: i.product.manufacturer?.name ?? null,
              images: i.product.images ?? [],
            }
          : null,
      })),
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------- Дії із замовленням */

/**
 * Без `items` бекенд скасовує замовлення цілком, зі списком — лише
 * вказані позиції. Строк скасування обмежений полем cancelOrderDays
 * у профілі, тому покладаємось на canBeCancelled з відповіді.
 */
export async function cancelOrder(order: string, items?: string[]) {
  const auth = await getApiAuth();
  return gqlRaw<{ cancelOrder: { errors: ApiFieldError[] | null } }>(
    /* GraphQL */ `
      mutation CancelOrder($order: String!, $items: [String!]) {
        cancelOrder(order: $order, items: $items) {
          errors {
            field
            messages
          }
        }
      }
    `,
    { auth, variables: { order, ...(items?.length ? { items } : {}) } },
  );
}

export async function addOrderComment(order: string, text: string) {
  const auth = await getApiAuth();
  return gqlRaw<{ addOrderComment: { errors: ApiFieldError[] | null } }>(
    /* GraphQL */ `
      mutation AddOrderComment($input: AddOrderCommentMutationInput!) {
        addOrderComment(input: $input) {
          errors {
            field
            messages
          }
        }
      }
    `,
    { auth, variables: { input: { order, text } } },
  );
}

/* --------------------------------------------------------- Повернення */

export type ReturnItem = {
  id: string;
  /** Номер повернення: числова частина глобального id */
  number: string;
  count: number;
  reason: number | null;
  reaction: number | null;
  description: string;
  comment: string;
  created: string;
  dispatch: string | null;
  dispatchInfo: string;
  accountUrl: string | null;
  accountNumber: number | null;
  manager: string;
  product: { slug: string; id: string; name: string; num: string } | null;
};

export type ReturnFilters = {
  /** Номер повернення */
  id?: string;
  dispatch?: string;
  product?: string;
  reason?: string;
  reaction?: string;
  account?: string;
  from?: string;
  to?: string;
};

const RETURNS = /* GraphQL */ `
  query Returns(
    $page: Int!
    $perPage: Int!
    $id: ID
    $dispatchInfo: String
    $product: String
    $reason: Int
    $reaction: Int
    $accountNumber: Decimal
    $range: DateRangeFieldInput
  ) {
    returnsAll(
      page: $page
      perPage: $perPage
      id: $id
      dispatchInfo_Icontains: $dispatchInfo
      product: $product
      reason: $reason
      reaction: $reaction
      accountNumber: $accountNumber
      createdDateRange: $range
    ) {
      totalCount
      pagesCount
      edges {
        id
        count
        reason
        reaction
        description
        comment
        created
        dispatch
        dispatchInfo
        accountUrl
        account {
          number
        }
        manager {
          fullName
        }
        orderItem {
          product {
            id
            slug
            name
            num
          }
        }
      }
    }
  }
`;

export type ReturnsPage = {
  items: ReturnItem[];
  totalCount: number;
  pagesCount: number;
};

/** Числова частина глобального id Relay: «ReturnsNode:123» → «123» */
function plainId(globalId: string) {
  try {
    const text = Buffer.from(globalId, "base64").toString("utf8");
    return text.split(":")[1] ?? globalId;
  } catch {
    return globalId;
  }
}

export async function getReturns(
  page = 1,
  perPage = 10,
  filters: ReturnFilters = {},
): Promise<ReturnsPage> {
  const auth = await getApiAuth();
  if (!auth) return { items: [], totalCount: 0, pagesCount: 0 };

  const variables: Record<string, unknown> = { page, perPage };
  if (filters.id && /^\d+$/.test(filters.id))
    variables.id = Buffer.from(`ReturnsNode:${filters.id}`).toString("base64");
  if (filters.dispatch) variables.dispatchInfo = filters.dispatch;
  if (filters.product) variables.product = filters.product;
  if (filters.reason) variables.reason = Number(filters.reason);
  if (filters.reaction) variables.reaction = Number(filters.reaction);
  if (filters.account && /^\d+$/.test(filters.account))
    variables.accountNumber = filters.account;
  if (filters.from || filters.to)
    variables.range = {
      start: filters.from || "2000-01-01",
      end: filters.to || "2100-01-01",
    };

  try {
    const data = await gql<{
      returnsAll: {
        totalCount: number | null;
        pagesCount: number | null;
        edges: {
          id: string;
          count: number;
          reason: number | null;
          reaction: number | null;
          description: string;
          comment: string;
          created: string;
          dispatch: string | null;
          dispatchInfo: string;
          accountUrl: string | null;
          account: { number: number | null } | null;
          manager: { fullName: string | null } | null;
          orderItem: {
            product: {
              id: string;
              slug: string;
              name: string;
              num: string;
            } | null;
          } | null;
        }[];
      } | null;
    }>(RETURNS, { auth, variables });

    const conn = data.returnsAll;
    if (!conn) return { items: [], totalCount: 0, pagesCount: 0 };

    return {
      items: conn.edges.map((e) => ({
        id: e.id,
        number: plainId(e.id),
        count: e.count,
        reason: e.reason,
        reaction: e.reaction,
        description: e.description,
        comment: e.comment,
        created: e.created,
        dispatch: e.dispatch,
        dispatchInfo: e.dispatchInfo,
        accountUrl: e.accountUrl,
        accountNumber: e.account?.number ?? null,
        manager: e.manager?.fullName ?? "",
        product: e.orderItem?.product ?? null,
      })),
      totalCount: conn.totalCount ?? 0,
      pagesCount: conn.pagesCount ?? 0,
    };
  } catch {
    return { items: [], totalCount: 0, pagesCount: 0 };
  }
}

/** Видалення повернення (бекенд дозволяє, поки менеджер його не опрацював) */
export async function deleteReturn(id: string) {
  const auth = await getApiAuth();
  return gqlRaw<{ deleteReturns: { __typename: string } | null }>(
    /* GraphQL */ `
      mutation DeleteReturns($ids: [ID]) {
        deleteReturns(returns: $ids) {
          __typename
        }
      }
    `,
    { auth, variables: { ids: [id] } },
  );
}

/** Довідники причин і рішень — відкриті анонімно, тому кешуємо на добу */
export async function getReturnDictionaries() {
  try {
    const data = await gql<{
      returnReasons: StatusMap | null;
      returnReactions: StatusMap | null;
    }>(
      /* GraphQL */ `
        query ReturnDictionaries {
          returnReasons
          returnReactions
        }
      `,
      { revalidate: 60 * 60 * 24, tags: ["return-dictionaries"] },
    );
    return {
      reasons: data.returnReasons ?? {},
      reactions: data.returnReactions ?? {},
    };
  } catch {
    return { reasons: {}, reactions: {} };
  }
}

export async function createReturn(input: {
  orderItem: string;
  reason: string;
  count: number;
  description?: string;
  images?: File[];
}) {
  const auth = await getApiAuth();
  const { images = [], ...fields } = input;
  return gqlRaw<{ returnOrderItem: { errors: ApiFieldError[] | null } }>(
    /* GraphQL */ `
      mutation ReturnOrderItem($input: ReturnOrderItemInput!) {
        returnOrderItem(input: $input) {
          errors {
            field
            messages
          }
        }
      }
    `,
    {
      auth,
      variables: {
        input: {
          ...fields,
          ...(images.length ? { images: images.map(() => null) } : {}),
        },
      },
      uploads: images.map((file, i) => ({
        path: `variables.input.images.${i}`,
        file,
      })),
    },
  );
}
