import { cache } from "react";
import { gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";

/* ------------------------------------------------------- Довідники форми */

export type UserTypeOption = { value: string; label: string };
export type RegionOption = { id: string; name: string };

type FormDataResponse = {
  requiredRegistrationFields: string[];
  userType: [string, string][];
  siteKey: string;
  regionAll: { edges: { id: string; name: string }[] };
};

const REGISTRATION_FORM_DATA = /* GraphQL */ `
  query RegistrationFormData {
    requiredRegistrationFields
    userType
    siteKey
    regionAll(perPage: 100) {
      edges {
        id
        name
      }
    }
  }
`;

export async function getRegistrationFormData() {
  const data = await gql<FormDataResponse>(REGISTRATION_FORM_DATA, {
    /* Довідник змінюється раз на рік — тримаємо в кеші добу */
    revalidate: 60 * 60 * 24,
    tags: ["registration-form"],
  });

  /* Бекенд віддає тип 7 двічі — прибираємо дублі за кодом */
  const seen = new Set<string>();
  const types: UserTypeOption[] = [];
  for (const [value, label] of data.userType) {
    if (seen.has(value)) continue;
    seen.add(value);
    types.push({ value, label });
  }

  const regions: RegionOption[] = [...data.regionAll.edges].sort((a, b) =>
    a.name.localeCompare(b.name, "uk"),
  );

  return {
    required: data.requiredRegistrationFields,
    /* Ключ reCAPTCHA беремо з API, а не хардкодимо — на проді він інший */
    siteKey: data.siteKey,
    types,
    regions,
  };
}

/* ------------------------------------------------------------- Мутації */

export type ApiFieldError = { field: string; messages: string[] };

type RegisterResponse = {
  registerUser: {
    loginOk: boolean | null;
    token: string | null;
    errors: ApiFieldError[];
    user: { id: string; email: string | null; firstName: string | null } | null;
  };
};

const REGISTER = /* GraphQL */ `
  mutation Register($input: RegisterMutationInput!) {
    registerUser(input: $input) {
      loginOk
      token
      errors {
        field
        messages
      }
      user {
        id
        email
        firstName
      }
    }
  }
`;

export type RegisterInput = {
  email: string;
  password: string;
  phone: string;
  fio: string;
  type: string;
  region: string;
  /** Токен reCAPTCHA v2. Поле обов'язкове — без нього бекенд падає */
  captcha: string;
};

export async function registerUser(input: RegisterInput) {
  return gqlRaw<RegisterResponse>(REGISTER, { variables: { input } });
}

type LoginResponse = {
  loginUser: {
    token: string | null;
    errors: ApiFieldError[] | null;
    user: { id: string; email: string | null; firstName: string | null } | null;
  };
};

const LOGIN = /* GraphQL */ `
  mutation Login($input: LoginMutationInput!) {
    loginUser(input: $input) {
      token
      errors {
        field
        messages
      }
      user {
        id
        email
        firstName
      }
    }
  }
`;

export async function loginUser(username: string, password: string) {
  return gqlRaw<LoginResponse>(LOGIN, {
    variables: { input: { username, password } },
  });
}

const LOGOUT = /* GraphQL */ `
  mutation Logout {
    logoutUser {
      __typename
    }
  }
`;

export async function logoutUser() {
  const auth = await getApiAuth();
  try {
    await gql(LOGOUT, { auth });
  } catch {
    /* Навіть якщо бекенд не відповів — свою куку все одно чистимо */
  }
}

/* --------------------------------------------------------- Поточний user */

export type CurrentUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  userType: string | null;
  fullName: string | null;
};

const ME = /* GraphQL */ `
  query Me {
    user {
      id
      email
      firstName
      lastName
      phone
      userType
      fullName
    }
  }
`;

/* cache() — щоб сторінка, яка питає «хто я» двічі (скажімо, підпис ціни
   і блок рівня цін), не слала два однакові запити на бекенд */
export const getCurrentUser = cache(
  async function getCurrentUser(): Promise<CurrentUser | null> {
    const auth = await getApiAuth();
    if (!auth) return null;
    try {
      const data = await gql<{ user: CurrentUser | null }>(ME, { auth });
      return data.user;
    } catch {
      return null;
    }
  },
);

/* ------------------------------------------- Відновлення пароля */

/**
 * Ключ reCAPTCHA окремим запитом: форму скидання пароля не треба
 * вантажити довідниками реєстрації заради одного поля.
 */
export async function getSiteKey() {
  try {
    const data = await gql<{ siteKey: string }>(
      /* GraphQL */ `
        query SiteKey {
          siteKey
        }
      `,
      { revalidate: 60 * 60 * 24, tags: ["site-key"] },
    );
    return data.siteKey ?? "";
  } catch {
    /* Недоступний API не повинен валити збірку. Порожній ключ показує
       в формі повідомлення про недоступну перевірку, а не білу сторінку */
    return "";
  }
}

type ResetPayload = { errors: ApiFieldError[] | null };

const REQUEST_PASSWORD_RESET = /* GraphQL */ `
  mutation RequestPasswordReset($input: RequestPasswordResetMutationInput!) {
    requestPasswordReset(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

/** Бекенд приймає або email, або телефон — але captcha обов'язкова завжди */
export async function requestPasswordReset(input: {
  email?: string;
  phone?: string;
  captcha: string;
}) {
  return gqlRaw<{ requestPasswordReset: ResetPayload }>(
    REQUEST_PASSWORD_RESET,
    { variables: { input } },
  );
}

const RESET_PASSWORD = /* GraphQL */ `
  mutation ResetPassword($input: ResetPasswordMutationInput!) {
    resetPassword(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export async function resetPassword(input: {
  user: number;
  token: string;
  newPassword: string;
  captcha: string;
}) {
  return gqlRaw<{ resetPassword: ResetPayload }>(RESET_PASSWORD, {
    variables: { input },
  });
}
