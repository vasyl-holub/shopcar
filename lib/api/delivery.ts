import { gql } from "@/lib/api/graphql";
import { npAreaCode } from "@/lib/np-areas";

export type Choice = { value: string; label: string };

const REGIONS = /* GraphQL */ `
  query Regions {
    regionAll {
      edges {
        id
        name
      }
    }
    npDeliveryServiceTypes
  }
`;

/** Області й типи доставки «Нової пошти» для форми оформлення */
export async function getDeliveryChoices(): Promise<{
  regions: Choice[];
  serviceTypes: Choice[];
}> {
  try {
    const data = await gql<{
      regionAll: { edges: { id: string; name: string }[] };
      npDeliveryServiceTypes: [string, string][] | null;
    }>(REGIONS, { revalidate: 60 * 60 * 24, tags: ["delivery-regions"] });

    return {
      regions: data.regionAll.edges
        .map((r) => ({ value: r.name, label: r.name }))
        .sort((a, b) => a.label.localeCompare(b.label, "uk")),
      serviceTypes: (data.npDeliveryServiceTypes ?? []).map(
        ([value, label]) => ({
          value,
          label,
        }),
      ),
    };
  } catch {
    return { regions: [], serviceTypes: [] };
  }
}

const CITIES = /* GraphQL */ `
  query Cities($area: String) {
    cityAll(area: $area) {
      edges {
        description
        ref
      }
    }
  }
`;

/** Міста області: value — код міста для запиту відділень */
export async function getCities(regionName: string): Promise<Choice[]> {
  const area = npAreaCode(regionName);
  if (!area) return [];
  try {
    const data = await gql<{
      cityAll: { edges: { description: string; ref: string }[] };
    }>(CITIES, {
      variables: { area },
      revalidate: 60 * 60 * 24,
      tags: ["delivery-cities"],
    });
    return data.cityAll.edges
      .filter((c) => c.description)
      .map((c) => ({ value: c.ref, label: c.description }))
      .sort((a, b) => a.label.localeCompare(b.label, "uk"));
  } catch {
    return [];
  }
}

const WAREHOUSES = /* GraphQL */ `
  query Warehouses($cityRef: String) {
    warehouseAll(cityRef: $cityRef) {
      edges {
        description
        number
        isActive
      }
    }
  }
`;

/** Відділення міста за кодом міста */
export async function getWarehouses(cityRef: string): Promise<Choice[]> {
  if (!cityRef) return [];
  try {
    const data = await gql<{
      warehouseAll: {
        edges: {
          description: string | null;
          number: number | null;
          isActive: boolean;
        }[];
      };
    }>(WAREHOUSES, {
      variables: { cityRef },
      revalidate: 60 * 60 * 6,
      tags: ["delivery-warehouses"],
    });
    return data.warehouseAll.edges
      .filter((w) => w.description && w.isActive !== false)
      .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
      .map((w) => ({ value: w.description!, label: w.description! }));
  } catch {
    return [];
  }
}
