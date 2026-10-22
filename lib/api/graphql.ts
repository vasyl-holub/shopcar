/**
 * Клієнт GraphQL-API WestPart.
 *
 * Усі запити йдуть з сервера Next.js, а не з браузера. Через це:
 *  — CORS не виникає взагалі;
 *  — сесію користувача ми тримаємо у себе й прокидаємо заголовком Cookie,
 *    тож фронту не обов'язково жити на піддомені westpart.ua.
 */

/* Django віддає 301 на адресу без слеша, а fetch, ідучи за редіректом,
   губить тіло POST — бекенд відповідає «Must provide query». Тому слеш
   дописуємо самі, щоб помилка в змінній середовища не ламала весь сайт. */
const ENDPOINT = (
  process.env.WESTPART_API_URL ?? "https://manage.shopcar.ua/api/graphql/"
).replace(/\/?$/, "/");

export type GraphQLErrorItem = {
  message: string;
  path?: (string | number)[];
};

/**
 * Приводить шлях до медіафайлу до повного URL.
 * Бекенд віддає то абсолютні посилання, то шляхи від кореня (/media/...),
 * а в іменах файлів трапляється кирилиця — її треба закодувати.
 */
export function mediaUrl(path?: string | null) {
  if (!path) return null;
  const full = /^https?:\/\//i.test(path)
    ? path
    : `${new URL(ENDPOINT).origin}${path.startsWith("/") ? "" : "/"}${path}`;
  /* Файли з /media лежать на публічному домені; на manage частини немає */
  return encodeURI(
    full.replace(
      /^https?:\/\/manage\.shopcar\.ua\/media\//i,
      "https://shopcar.ua/media/",
    ),
  );
}

/**
 * Те саме перетворення для документів бекенда: `printUrl` і `checkUrl`
 * у замовленні приходять шляхом від кореня (/orders/139204/print/),
 * і без origin браузер шукав би їх на нашому домені, а не на Django.
 */
export const backendUrl = mediaUrl;

export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    readonly errors: GraphQLErrorItem[],
  ) {
    super(message);
    this.name = "GraphQLRequestError";
  }
}

export type ApiAuth = {
  /** Значення cookie sessionid від Django */
  sessionid?: string;
  /** Django вимагає csrftoken для «небезпечних» методів, коли є сесія */
  csrftoken?: string;
};

type RequestOptions = {
  variables?: Record<string, unknown>;
  auth?: ApiAuth;
  /**
   * Кеш Next.js. За замовчуванням не кешуємо: ціни й наявність
   * змінюються, а для частини клієнтів вони ще й персональні.
   * Для довідників (бренди, регіони, контент) вказуємо revalidate явно.
   */
  revalidate?: number | false;
  tags?: string[];
  signal?: AbortSignal;
  /**
   * Файли для полів типу Upload (специфікація GraphQL multipart request).
   * `path` — шлях до місця у змінних, напр. `variables.input.images.0`;
   * у самих змінних на цьому місці має стояти null.
   */
  uploads?: { path: string; file: File }[];
};

export type RawResult<T> = {
  data: T;
  /** Set-Cookie з відповіді — звідси дістаємо сесію після логіну */
  setCookie: string[];
};

/* Cloudflare перед бекендом відповідає запитам із хостингу перевіркою
   «Just a moment» замість даних. Обхід робиться правилом на їхньому боці:
   пропускати запити з домовленим заголовком. Поки змінних немає, нічого
   не додаємо — локально й так усе працює. */
const API_KEY = process.env.WESTPART_API_KEY;
const API_KEY_HEADER = process.env.WESTPART_API_KEY_HEADER ?? "X-Front-Key";

function buildHeaders(auth?: ApiAuth, multipart?: boolean): HeadersInit {
  /* У multipart Content-Type із boundary виставляє сам fetch */
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!multipart) headers["Content-Type"] = "application/json";

  if (API_KEY) headers[API_KEY_HEADER] = API_KEY;

  const cookies: string[] = [];
  if (auth?.sessionid) cookies.push(`sessionid=${auth.sessionid}`);
  if (auth?.csrftoken) {
    cookies.push(`csrftoken=${auth.csrftoken}`);
    headers["X-CSRFToken"] = auth.csrftoken;
    /* Django звіряє Referer для POST по HTTPS із сесією */
    headers["Referer"] = new URL(ENDPOINT).origin;
  }
  if (cookies.length) headers["Cookie"] = cookies.join("; ");

  return headers;
}

function readSetCookie(res: Response): string[] {
  /* getSetCookie() — єдиний спосіб дістати кілька Set-Cookie з одного
     заголовка; у старих рантаймах його немає, тому є запасний шлях */
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

/** Запит із доступом до Set-Cookie — потрібен для логіну й реєстрації */
export async function gqlRaw<T>(
  query: string,
  { variables, auth, revalidate, tags, signal, uploads }: RequestOptions = {},
): Promise<RawResult<T>> {
  let body: BodyInit = JSON.stringify({ query, variables });
  if (uploads?.length) {
    const form = new FormData();
    form.append("operations", body);
    form.append(
      "map",
      JSON.stringify(
        Object.fromEntries(uploads.map((u, i) => [String(i), [u.path]])),
      ),
    );
    uploads.forEach((u, i) => form.append(String(i), u.file, u.file.name));
    body = form;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: buildHeaders(auth, Boolean(uploads?.length)),
    body,
    signal,
    ...(revalidate === undefined
      ? { cache: "no-store" as const }
      : {
          next: {
            revalidate: revalidate === false ? undefined : revalidate,
            tags,
          },
        }),
  });

  if (!res.ok && res.status >= 500) {
    throw new GraphQLRequestError(
      `Бекенд відповів ${res.status}. Спробуйте пізніше.`,
      [],
    );
  }

  /* Бекенд за певних умов віддає HTML — сторінку помилки або перевірку
     Cloudflare. Тоді res.json() кидає SyntaxError, з якого неможливо
     зрозуміти, що сталося: саме так падала збірка на /feedback. */
  const text = await res.text();
  let json: { data?: T; errors?: GraphQLErrorItem[] };
  try {
    json = JSON.parse(text) as { data?: T; errors?: GraphQLErrorItem[] };
  } catch {
    /* У логах сервера видно, що саме прийшло: сторінка 404 від Django
       означає неправильну адресу в WESTPART_API_URL, а перевірка
       Cloudflare — що бекенд не пускає запити з хостингу */
    console.error(
      `[graphql] не JSON з ${ENDPOINT} (HTTP ${res.status}):`,
      text.slice(0, 200),
    );
    throw new GraphQLRequestError(
      `API повернув не JSON (HTTP ${res.status}). Перші символи: ` +
        text.slice(0, 80).replace(/\s+/g, " "),
      [],
    );
  }

  /* Часткові дані з помилками теж можливі — але якщо data порожня,
     працювати нема з чим */
  if (json.errors?.length && json.data == null) {
    throw new GraphQLRequestError(json.errors[0].message, json.errors);
  }

  if (json.data == null) {
    throw new GraphQLRequestError("Порожня відповідь від API", []);
  }

  /* Коли резолвер падає, бекенд віддає 200 із помилкою в `errors`, але
     `data` лишається обʼєктом, де всі поля null. Без цієї перевірки
     мутація виглядала б успішною: виклик не кидає, а payload порожній,
     тож перевірка `payload?.errors` нічого не знаходить. Саме так
     «успішно опублікований» відгук нікуди не зберігався. */
  if (json.errors?.length && typeof json.data === "object") {
    const fields = Object.values(json.data as Record<string, unknown>);
    if (fields.length > 0 && fields.every((v) => v === null)) {
      throw new GraphQLRequestError(json.errors[0].message, json.errors);
    }
  }

  return { data: json.data, setCookie: readSetCookie(res) };
}

export async function gql<T>(
  query: string,
  options: RequestOptions = {},
): Promise<T> {
  const { data } = await gqlRaw<T>(query, options);
  return data;
}
