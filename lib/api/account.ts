import { gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import type { ApiFieldError } from "@/lib/api/auth";

/* ---------------------------------------------------------- Профіль */

export type Manager = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
};

export type Profile = {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  company: string;
  city: string;
  address: string;
  regionId: string | null;
  regionName: string | null;
  birthday: string | null;
  countryId: string | null;
  countryName: string | null;
  recipient: string;
  deliveryInfo: string;
  payMethodId: string | null;
  payMethodName: string | null;
  deliveryId: string | null;
  deliveryName: string | null;
  userType: number | null;
  /** Номер клієнта — його питає менеджер по телефону */
  number: string | null;
  balance: number | null;
  debt: number | null;
  needToPay: number | null;
  balanceLimit: number | null;
  creditDays: number;
  manager: Manager | null;
};

const PROFILE = /* GraphQL */ `
  query Profile {
    user {
      id
      firstName
      lastName
      fatherName
      fullName
      email
      getPhone
      company
      city
      address
      region {
        id
        name
      }
      birthday
      country {
        id
        name
      }
      recipient
      deliveryInfo
      payMethod {
        id
        name
      }
      delivery {
        id
        name
      }
      userType
      number
      balance
      debt
      needToPay
      balanceLimit
      creditDays
      manager {
        fullName
        email
        phone
      }
    }
  }
`;

type ProfileResponse = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    fatherName: string;
    fullName: string | null;
    email: string;
    getPhone: string | null;
    company: string;
    city: string;
    address: string;
    region: { id: string; name: string } | null;
    birthday: string | null;
    country: { id: string; name: string } | null;
    recipient: string;
    deliveryInfo: string;
    payMethod: { id: string; name: string } | null;
    delivery: { id: string; name: string } | null;
    userType: number | null;
    number: string | null;
    balance: number | null;
    debt: number | null;
    needToPay: number | null;
    balanceLimit: number | null;
    creditDays: number;
    manager: {
      fullName: string | null;
      email: string | null;
      phone: string[] | null;
    } | null;
  } | null;
};

export async function getProfile(): Promise<Profile | null> {
  const auth = await getApiAuth();
  if (!auth) return null;

  try {
    const data = await gql<ProfileResponse>(PROFILE, { auth });
    const u = data.user;
    if (!u) return null;

    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      fatherName: u.fatherName,
      fullName: u.fullName,
      email: u.email,
      /* phone у схемі це список — беремо готове getPhone, воно вже рядок */
      phone: u.getPhone,
      company: u.company,
      city: u.city,
      address: u.address,
      regionId: u.region?.id ?? null,
      regionName: u.region?.name ?? null,
      birthday: u.birthday,
      countryId: u.country?.id ?? null,
      countryName: u.country?.name ?? null,
      recipient: u.recipient,
      deliveryInfo: u.deliveryInfo,
      payMethodId: u.payMethod?.id ?? null,
      payMethodName: u.payMethod?.name ?? null,
      deliveryId: u.delivery?.id ?? null,
      deliveryName: u.delivery?.name ?? null,
      userType: u.userType,
      number: u.number,
      balance: u.balance,
      debt: u.debt,
      needToPay: u.needToPay,
      balanceLimit: u.balanceLimit,
      creditDays: u.creditDays,
      manager: u.manager
        ? {
            fullName: u.manager.fullName,
            email: u.manager.email,
            phone: u.manager.phone?.[0] ?? null,
          }
        : null,
    };
  } catch {
    return null;
  }
}

const UPDATE_USER = /* GraphQL */ `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export type ProfileInput = {
  firstName: string;
  lastName: string;
  fatherName: string;
  email: string;
  /** Схема чекає список — навіть якщо телефон один */
  phone: string[];
  company?: string;
  city?: string;
  address?: string;
  region?: string;
};

export async function updateProfile(input: ProfileInput) {
  const auth = await getApiAuth();
  return gqlRaw<{ updateUser: { errors: ApiFieldError[] | null } }>(
    UPDATE_USER,
    { auth, variables: { input } },
  );
}

/** Часткове оновлення профілю: лише передані поля (тип, країна, склад доставки…) */
export async function updateProfileFields(
  input: Record<string, string | string[]>,
) {
  const auth = await getApiAuth();
  return gqlRaw<{ updateUser: { errors: ApiFieldError[] | null } }>(
    UPDATE_USER,
    { auth, variables: { input } },
  );
}

const CHANGE_PASSWORD = /* GraphQL */ `
  mutation ChangePassword($input: ChangePasswordMutationInput!) {
    changePassword(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export async function changePassword(oldPassword: string, newPassword: string) {
  const auth = await getApiAuth();
  return gqlRaw<{ changePassword: { errors: ApiFieldError[] | null } }>(
    CHANGE_PASSWORD,
    { auth, variables: { input: { oldPassword, newPassword } } },
  );
}

/* ------------------------------------------------------------ Гараж */

export type UserCar = {
  id: string;
  brand: string;
  model: string;
  modification: string;
  year: number;
  vin: string;
  litres: string;
  typeDisplay: string | null;
  bodyDisplay: string | null;
  driveDisplay: string | null;
  transmissionDisplay: string | null;
};

const USER_CARS = /* GraphQL */ `
  query UserCars {
    userCarAll(page: 1, perPage: 50) {
      totalCount
      edges {
        id
        brand
        model
        modification
        year
        vin
        litres
        typeDisplay
        bodyDisplay
        driveDisplay
        transmissionDisplay
      }
    }
  }
`;

export async function getUserCars(): Promise<UserCar[]> {
  const auth = await getApiAuth();
  if (!auth) return [];
  try {
    const data = await gql<{
      userCarAll: { edges: UserCar[] } | null;
    }>(USER_CARS, { auth });
    return data.userCarAll?.edges ?? [];
  } catch {
    return [];
  }
}

const SAVE_CAR = /* GraphQL */ `
  mutation SaveUserCar($input: UpdateUserCarInput!) {
    updateUserCar(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

/**
 * Одна мутація і на створення, і на редагування: без `id` бекенд
 * додає авто, з `id` — оновлює наявне.
 */
export type UserCarInput = {
  id?: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  litres: string;
  body: string;
  modification?: string;
  vin?: string;
  transmission?: string;
  drive?: string;
};

export async function saveUserCar(input: UserCarInput) {
  const auth = await getApiAuth();
  return gqlRaw<{ updateUserCar: { errors: ApiFieldError[] | null } }>(
    SAVE_CAR,
    { auth, variables: { input } },
  );
}

export async function deleteUserCar(carId: string) {
  const auth = await getApiAuth();
  return gqlRaw<{ deleteUserCar: { errors: ApiFieldError[] | null } }>(
    /* GraphQL */ `
      mutation DeleteUserCar($carId: ID!) {
        deleteUserCar(carId: $carId) {
          errors {
            field
            messages
          }
        }
      }
    `,
    { auth, variables: { carId } },
  );
}

/* ----------------------------------------------------------- Обране */

export type FavoriteItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  num: string;
  brand: string | null;
  /** Фото товару: перше джерело — основне, решта — запасні */
  images: string[];
  /** «Ціна від», грн */
  price: number | null;
  /** Пропозиція складу для «КУПИТИ» і її залишок */
  offerId: string | null;
  count: number | null;
  canBuy: boolean;
};

const FAVORITES = /* GraphQL */ `
  query Favorites($page: Int!, $perPage: Int!) {
    productLikeAll(page: $page, perPage: $perPage) {
      totalCount
      pagesCount
      edges {
        id
        product {
          id
          slug
          name
          num
          manufacturer {
            name
          }
          images
          price {
            id
            priceOut
            priceUser
            count
            canBuy
          }
        }
      }
    }
  }
`;

export type FavoritesPage = {
  items: FavoriteItem[];
  totalCount: number;
  pagesCount: number;
};

export async function getFavorites(
  page = 1,
  perPage = 12,
): Promise<FavoritesPage> {
  const auth = await getApiAuth();
  if (!auth) return { items: [], totalCount: 0, pagesCount: 0 };

  try {
    const data = await gql<{
      productLikeAll: {
        totalCount: number | null;
        pagesCount: number | null;
        edges: {
          id: string;
          product: {
            id: string;
            slug: string;
            name: string;
            num: string;
            manufacturer: { name: string } | null;
            images: string[] | null;
            price: {
              id: string;
              priceOut: number | null;
              priceUser: number | null;
              count: number | null;
              canBuy: boolean | null;
            } | null;
          } | null;
        }[];
      } | null;
    }>(FAVORITES, { auth, variables: { page, perPage } });

    const conn = data.productLikeAll;
    if (!conn) return { items: [], totalCount: 0, pagesCount: 0 };

    return {
      /* Товар міг зникнути з каталогу — такі лайки просто пропускаємо */
      items: conn.edges.flatMap((e) =>
        e.product
          ? [
              {
                id: e.id,
                productId: e.product.id,
                slug: e.product.slug,
                name: e.product.name,
                num: e.product.num,
                brand: e.product.manufacturer?.name ?? null,
                images: e.product.images ?? [],
                price:
                  e.product.price?.priceUser ??
                  e.product.price?.priceOut ??
                  null,
                offerId: e.product.price?.id ?? null,
                count: e.product.price?.count ?? null,
                canBuy: Boolean(e.product.price?.canBuy),
              },
            ]
          : [],
      ),
      totalCount: conn.totalCount ?? 0,
      pagesCount: conn.pagesCount ?? 0,
    };
  } catch {
    return { items: [], totalCount: 0, pagesCount: 0 };
  }
}

export async function removeFavorite(productId: string) {
  const auth = await getApiAuth();
  return gqlRaw<{ deleteProductLike: { errors: ApiFieldError[] | null } }>(
    /* GraphQL */ `
      mutation DeleteProductLike($product: ID) {
        deleteProductLike(product: $product) {
          errors {
            field
            messages
          }
        }
      }
    `,
    { auth, variables: { product: productId } },
  );
}

/* ------------------------------------------- Довідники для гаража */

export type Option = { value: string; label: string };

/**
 * Усі чотири довідники — пари [код, назва]. Кузов беремо саме з
 * `carBodies`, а не з `carBodyAll`: це різні набори. `carBodyAll` —
 * довідник кузовів у дереві автомобілів, і його id у полі
 * `UserCar.body` означають зовсім інші кузови (перевірено: код 10
 * там «купе», а в авто зберігається «лімузин»).
 */
const CAR_ATTRS = /* GraphQL */ `
  query CarAttributes {
    carType
    carTransmission
    carDrive
    carBodies
  }
`;

export type CarAttributes = {
  types: Option[];
  bodies: Option[];
  transmissions: Option[];
  drives: Option[];
};

export async function getCarAttributes(): Promise<CarAttributes> {
  const empty: CarAttributes = {
    types: [],
    bodies: [],
    transmissions: [],
    drives: [],
  };

  try {
    const data = await gql<{
      carType: [string, string][] | null;
      carTransmission: [string, string][] | null;
      carDrive: [string, string][] | null;
      carBodies: [string, string][] | null;
    }>(CAR_ATTRS, {
      revalidate: 60 * 60 * 24,
      tags: ["car-attributes"],
    });

    const pairs = (list: [string, string][] | null): Option[] =>
      (list ?? []).map(([value, label]) => ({ value, label }));

    return {
      types: pairs(data.carType),
      transmissions: pairs(data.carTransmission),
      drives: pairs(data.carDrive),
      bodies: pairs(data.carBodies),
    };
  } catch {
    return empty;
  }
}

export async function addFavorite(productId: string) {
  const auth = await getApiAuth();
  /* Ця мутація єдина в наборі без поля errors — повертає сам лайк */
  return gqlRaw<{ addProductLike: { productLike: { id: string } | null } }>(
    /* GraphQL */ `
      mutation AddProductLike($product: String) {
        addProductLike(product: $product) {
          productLike {
            id
          }
        }
      }
    `,
    { auth, variables: { product: productId } },
  );
}

/** Назви типів клієнта: 1 роздріб, 2 опт, 4 магазин, 5 СТО тощо */
export async function getUserTypeLabels(): Promise<Record<string, string>> {
  try {
    const data = await gql<{ userType: [string, string][] | null }>(
      /* GraphQL */ `
        query UserTypes {
          userType
        }
      `,
      { revalidate: 60 * 60 * 24, tags: ["user-types"] },
    );
    return Object.fromEntries(data.userType ?? []);
  } catch {
    return {};
  }
}
