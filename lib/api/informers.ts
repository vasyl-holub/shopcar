import { gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";

export type Informer = {
  id: string;
  subject: string;
  isRead: boolean;
  created: string;
  sender: string;
};

const INFORMERS = /* GraphQL */ `
  query Informers {
    informerAll(showAll: true, perPage: 100) {
      edges {
        id
        subject
        isRead
        isDeleted
        created
        sender {
          email
        }
      }
    }
  }
`;

/**
 * Список повідомлень кабінету (системні листи про замовлення, оплати тощо).
 * Тіла листів сюди свідомо не входять: це повні HTML-документи по десятки
 * кілобайт, і сотня таких у відповіді робила відкриття кабінету після входу
 * хвилинним. Текст підвантажується окремо, коли лист відкривають.
 */
export async function getInformers(): Promise<Informer[]> {
  const auth = await getApiAuth();
  if (!auth) return [];
  try {
    const data = await gql<{
      informerAll: {
        edges: {
          id: string;
          subject: string | null;
          isRead: boolean | null;
          isDeleted: boolean | null;
          created: string | null;
          sender: { email: string | null } | null;
        }[];
      } | null;
    }>(INFORMERS, { auth });
    return (data.informerAll?.edges ?? [])
      .filter((e) => !e.isDeleted)
      .map((e) => ({
        id: e.id,
        subject: e.subject ?? "",
        isRead: Boolean(e.isRead),
        created: e.created ?? "",
        sender: e.sender?.email ?? "",
      }));
  } catch {
    return [];
  }
}

/** Текст одного листа; порожній рядок, якщо бекенд не відповів */
export async function getInformerText(id: string): Promise<string> {
  const auth = await getApiAuth();
  if (!auth) return "";
  try {
    const data = await gql<{ informer: { text: string | null } | null }>(
      /* GraphQL */ `
        query InformerText($id: ID) {
          informer(id: $id) {
            text
          }
        }
      `,
      { auth, variables: { id } },
    );
    return data.informer?.text ?? "";
  } catch {
    return "";
  }
}

export async function markInformersRead(ids: string[]) {
  const auth = await getApiAuth();
  return gqlRaw<{ makeReadInformer: { errors: string[] } }>(
    /* GraphQL */ `
      mutation ReadInformers($ids: [ID]!) {
        makeReadInformer(ids: $ids) {
          errors
        }
      }
    `,
    { auth, variables: { ids } },
  );
}

export async function deleteInformers(ids: string[]) {
  const auth = await getApiAuth();
  return gqlRaw<{ makeDeletedInformer: { errors: string[] } }>(
    /* GraphQL */ `
      mutation DeleteInformers($ids: [ID]!) {
        makeDeletedInformer(ids: $ids) {
          errors
        }
      }
    `,
    { auth, variables: { ids } },
  );
}
