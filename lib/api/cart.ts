import { gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth, saveSession } from "@/lib/api/session";
import type { Cart, CartItem } from "@/lib/cart-format";

/* Типи й чисті функції живуть окремо, щоб їх могли імпортувати
   клієнтські компоненти — див. коментар у lib/cart-format.ts */
export type { Cart, CartItem, Shipment } from "@/lib/cart-format";
export { deliveryLabel, groupByDelivery, totalUnits } from "@/lib/cart-format";

/**
 * Кошик прив'язаний до сесії Django, тому працює і для незалогінених.
 *
 * Пастка бекенду: поле `items` усередині `cartAll` падає з помилкою
 * «'RelatedManager' object is not subscriptable». Тому позиції беремо
 * окремим запитом `cartItemAll(cartId)`.
 */

const CART_LIST = /* GraphQL */ `
  query Carts {
    cartAll {
      totalCount
      edges {
        id
        total
        totalCount
        existActive
      }
    }
  }
`;

const CART_ITEMS = /* GraphQL */ `
  query CartItems($cartId: ID) {
    cartItemAll(cartId: $cartId) {
      totalCount
      edges {
        id
        count
        price
        total
        isActive
        comment
        store {
          name
          returnDays
          isLocalStore
          publicNote
          warning
          priority
          number
          updated
          deliveryDays
          workUpTo
          address
          phone
          url
          description
        }
        product {
          id
          num
          name
          slug
          images
          manufacturer {
            name
          }
          specs {
            edges {
              value
              spec {
                name
              }
            }
          }
        }
        priceItem {
          id
          priceOut
          count
          deliveryDaysHumanize
          canBuy
          comment
        }
      }
    }
  }
`;

type CartListResponse = {
  cartAll: {
    edges: {
      id: string;
      total: number | null;
      totalCount: number | null;
      existActive: boolean | null;
    }[];
  };
};

type CartItemsResponse = {
  cartItemAll: { edges: CartItem[] };
};

/** Порожній кошик — щоб сторінка не мала розрізняти null і «нічого немає» */
const EMPTY: Cart = { id: "", total: 0, positions: 0, items: [] };

/**
 * У товарі всередині кошика доступне лише поле `images`, і в частини
 * позицій воно порожнє, хоча головне фото у товару є. Дістаємо його
 * окремим запитом: `image` існує тільки на повному типі товару.
 */
const PRODUCT_IMAGES = /* GraphQL */ `
  query ProductImages($ids: [ID]) {
    productAll(ids: $ids, perPage: 50) {
      edges {
        id
        image
      }
    }
  }
`;

type ImagesResponse = {
  productAll: { edges: { id: string; image: string | null }[] };
};

async function fillMissingImages(items: CartItem[]) {
  const ids = items
    .filter((i) => i.product && !i.product.images?.length)
    .map((i) => i.product!.id);

  if (!ids.length) return items;

  try {
    const data = await gql<ImagesResponse>(PRODUCT_IMAGES, {
      variables: { ids },
    });

    const byId = new Map(
      data.productAll.edges.map((p) => [p.id, p.image] as const),
    );

    return items.map((item) => {
      if (!item.product || item.product.images?.length) return item;
      const image = byId.get(item.product.id);
      if (!image) return item;
      return { ...item, product: { ...item.product, images: [image] } };
    });
  } catch (error) {
    /* Фото — не критично, показуємо заглушку й працюємо далі */
    console.error("Не вдалося дотягнути фото товарів кошика:", error);
    return items;
  }
}

/**
 * `activeOnly` — лише позиції, які клієнт відмітив для замовлення (на
 * сторінці кошика показуємо всі, а оформлення бачить тільки відмічені).
 */
export async function getCart({
  activeOnly = false,
}: { activeOnly?: boolean } = {}): Promise<Cart> {
  const auth = await getApiAuth();

  try {
    const list = await gql<CartListResponse>(CART_LIST, {
      auth,
      /* Кошик персональний і змінюється щохвилини — не кешуємо */
    });

    const cart = list.cartAll.edges[0];
    if (!cart) return EMPTY;

    const data = await gql<CartItemsResponse>(CART_ITEMS, {
      auth,
      variables: { cartId: cart.id },
    });

    const items = await fillMissingImages(
      activeOnly
        ? data.cartItemAll.edges.filter((i) => i.isActive)
        : data.cartItemAll.edges,
    );
    const chosen = items.filter((i) => i.isActive);

    return {
      id: cart.id,
      total: chosen.reduce((s, i) => s + (i.total ?? 0), 0),
      positions: chosen.length,
      items,
    };
  } catch (error) {
    /* Помилку обов'язково в лог: мовчазний порожній кошик уже одного разу
       сховав невалідний запит, і це виглядало як «фото не підтягнулось» */
    console.error("Не вдалося прочитати кошик:", error);
    return EMPTY;
  }
}

/* ------------------------------------------------------------ Мутації */

/**
 * Мутації викликаються лише із Server Actions, тому тут можна писати куки.
 * Незалогіненому відвідувачу Django видає сесію саме на першій дії з
 * кошиком — якщо її не зберегти, кошик загубиться на наступному запиті.
 */
async function mutate<T>(query: string, variables?: Record<string, unknown>) {
  const auth = await getApiAuth();
  const res = await gqlRaw<T>(query, { variables, auth });
  if (res.setCookie.length) await saveSession(res.setCookie);
  return res.data;
}

const ADD_ITEM = /* GraphQL */ `
  mutation AddCartItem($itemId: ID!, $count: Int) {
    addCartItem(itemId: $itemId, count: $count) {
      __typename
    }
  }
`;

export async function addCartItem(itemId: string, count = 1) {
  return mutate(ADD_ITEM, { itemId, count });
}

const CHANGE_ITEMS = /* GraphQL */ `
  mutation ChangeCartItems($cartItems: [ID], $count: Int) {
    changeCartItems(cartItems: $cartItems, count: $count) {
      __typename
    }
  }
`;

export async function setCartItemCount(cartItemId: string, count: number) {
  return mutate(CHANGE_ITEMS, { cartItems: [cartItemId], count });
}

const SET_ACTIVE = /* GraphQL */ `
  mutation SetCartItemsActive($cartItems: [ID], $isActive: Boolean) {
    changeCartItems(cartItems: $cartItems, isActive: $isActive) {
      __typename
    }
  }
`;

/** Відмічає позиції для замовлення (true) або знімає відмітку (false) */
export async function setCartItemsActive(ids: string[], isActive: boolean) {
  return mutate(SET_ACTIVE, { cartItems: ids, isActive });
}

const DELETE_ITEMS = /* GraphQL */ `
  mutation DeleteCartItems($cartItems: [ID]) {
    deleteCartItems(cartItems: $cartItems) {
      __typename
    }
  }
`;

export async function deleteCartItems(ids: string[]) {
  return mutate(DELETE_ITEMS, { cartItems: ids });
}

/* ------------------------------------------------- Оформлення замовлення */

export type OrderOption = {
  id: string;
  name: string;
  /** Перший рядок опису перевізника: «Контакт-центр (пон-суб с 8:00 до 20:00)» */
  note?: string;
  /** Самовивіз: для нього не потрібні адреса й перевізник */
  selfPickup?: boolean;
};

/** Перший рядок HTML-опису без тегів: до першого <br> чи кінця абзацу */
function firstLine(html: string | null) {
  if (!html) return undefined;
  const head = html.split(/<br\s*\/?>|<\/p>/i)[0] ?? "";
  const text = head
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || undefined;
}

const ORDER_OPTIONS = /* GraphQL */ `
  query OrderOptions {
    deliveryAll {
      edges {
        id
        name
        description
        selfPickup
      }
    }
    payMethodAll {
      edges {
        id
        name
      }
    }
  }
`;

/** Способи доставки й оплати для форми оформлення */
export async function getOrderOptions(): Promise<{
  deliveries: OrderOption[];
  payMethods: OrderOption[];
}> {
  try {
    const data = await gql<{
      deliveryAll: {
        edges: {
          id: string;
          name: string | null;
          description: string | null;
          selfPickup: boolean | null;
        }[];
      };
      payMethodAll: { edges: { id: string; name: string | null }[] };
    }>(ORDER_OPTIONS, { revalidate: 60 * 60, tags: ["order-options"] });

    const clean = (list: { id: string; name: string | null }[]) =>
      list.filter((x) => x.name).map((x) => ({ id: x.id, name: x.name! }));

    return {
      deliveries: data.deliveryAll.edges
        .filter((x) => x.name)
        .map((x) => ({
          id: x.id,
          name: x.name!,
          note: firstLine(x.description),
          selfPickup: Boolean(x.selfPickup),
        })),
      payMethods: clean(data.payMethodAll.edges),
    };
  } catch {
    return { deliveries: [], payMethods: [] };
  }
}

const CAN_CHANGE_DELIVERY = /* GraphQL */ `
  query CanChangeDelivery {
    canUserChangeDelivery
  }
`;

/**
 * Чи може клієнт сам обирати доставку. Якщо ні, форма лишає лише контакти:
 * доставку й оплату призначає менеджер.
 */
export async function canChangeDelivery(): Promise<boolean> {
  const auth = await getApiAuth();
  try {
    const data = await gql<{ canUserChangeDelivery: boolean | null }>(
      CAN_CHANGE_DELIVERY,
      { auth },
    );
    return data.canUserChangeDelivery !== false;
  } catch {
    return true;
  }
}

const CART_COUNT = /* GraphQL */ `
  query CartCount {
    cartAll {
      edges {
        totalCount
        existActive
      }
    }
  }
`;

/**
 * Лише кількість позицій для значка в шапці. Окремий легкий запит,
 * щоб не тягнути весь кошик із товарами й цінами заради одного числа.
 */
export async function getCartCount(): Promise<number> {
  const auth = await getApiAuth();
  try {
    const data = await gql<{
      cartAll: { edges: { totalCount: number | null; existActive: boolean }[] };
    }>(CART_COUNT, { auth });
    const cart = data.cartAll.edges.find((c) => c.existActive);
    return cart?.totalCount ?? 0;
  } catch {
    return 0;
  }
}
