"use server";

import { gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";

export type OfferInfo = {
  name: string;
  num: string;
  brand: string | null;
  images: string[];
  /** Скільки є на складі */
  count: number | null;
  days: string | null;
  note: string | null;
  warning: string | null;
  description: string | null;
  /** Характеристики товару: «Висота [мм]: 99» */
  specs: { name: string; value: string }[];
  isLocal: boolean;
  /** Назва складу: для чужих складів показується замість строку */
  storeName: string | null;
  returns: boolean;
  /** Ціна за одиницю, грн */
  price: number;
};

const OFFER = /* GraphQL */ `
  query OfferInfo($id: ID!) {
    storeItemNode(id: $id) {
      count
      comment
      description
      deliveryDaysHumanize
      priceOut
      priceUser
      store {
        name
        warning
        isLocalStore
        returnDays
      }
      product {
        name
        num
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
    }
  }
`;

/** Дані пропозиції для вікна «Додати товар»: що саме, скільки є й за якою ціною */
export async function offerInfoAction(id: string): Promise<OfferInfo | null> {
  const auth = await getApiAuth();
  try {
    const data = await gql<{
      storeItemNode: {
        count: number | null;
        comment: string | null;
        description: string | null;
        deliveryDaysHumanize: string | null;
        priceOut: number | null;
        priceUser: number | null;
        store: {
          name: string | null;
          warning: string | null;
          isLocalStore: boolean | null;
          returnDays: number | null;
        } | null;
        product: {
          name: string | null;
          num: string | null;
          images: string[] | null;
          manufacturer: { name: string | null } | null;
          specs: {
            edges: {
              value: string | null;
              spec: { name: string | null } | null;
            }[];
          } | null;
        } | null;
      } | null;
    }>(OFFER, { variables: { id }, auth });

    const o = data.storeItemNode;
    if (!o?.product) return null;

    return {
      name: o.product.name ?? "",
      num: o.product.num ?? "",
      brand: o.product.manufacturer?.name ?? null,
      images: o.product.images ?? [],
      count: o.count,
      days: o.deliveryDaysHumanize?.trim() || null,
      note: o.comment?.trim() || null,
      warning: o.store?.warning?.trim() || null,
      description: o.description?.trim() || null,
      specs: (o.product.specs?.edges ?? []).flatMap((e) =>
        e.spec?.name && e.value ? [{ name: e.spec.name, value: e.value }] : [],
      ),
      isLocal: Boolean(o.store?.isLocalStore),
      storeName: o.store?.name?.trim() || null,
      returns: (o.store?.returnDays ?? 0) > 0,
      price: o.priceUser ?? o.priceOut ?? 0,
    };
  } catch {
    return null;
  }
}
