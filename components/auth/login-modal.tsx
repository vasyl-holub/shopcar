"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  UnderlineField,
  UnderlineSelect,
} from "@/components/checkout/checkout-fields";
import { Recaptcha } from "@/components/auth/recaptcha";
import { Modal } from "@/components/ui/modal";
import { ShopIcon } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import { loginActionFn, type AuthFormState } from "@/app/login/actions";
import { registerAction } from "@/app/register/actions";
import { registrationOptionsAction } from "@/app/register/options-action";
import {
  requestResetAction,
  type ResetFormState,
} from "@/app/password/reset/actions";
import { siteKeyAction } from "@/app/password/reset/site-key-action";
import {
  profileOptionsAction,
  saveProfileDetailsAction,
} from "@/app/account/profile-details-action";
import { citiesAction } from "@/app/checkout/delivery-actions";
import type { AccountFormState } from "@/app/account/actions";

type View = "login" | "reset" | "register" | "profile";

/** Поле пароля з оком: показує й ховає введене */
function PasswordField({
  id,
  name,
  label,
  required,
  autoComplete,
  error,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  autoComplete: string;
  error?: string;
}) {
  const [shown, setShown] = useState(false);

  return (
    <UnderlineField
      id={id}
      name={name}
      type={shown ? "text" : "password"}
      label={label}
      required={required}
      autoComplete={autoComplete}
      error={error}
      trailing={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Сховати пароль" : "Показати пароль"}
          className="-my-2 -mr-2 flex size-10 shrink-0 cursor-pointer items-center justify-center text-orange lg:m-0 lg:size-6"
        >
          {shown ? (
            <Eye aria-hidden className="size-6" strokeWidth={1.75} />
          ) : (
            <EyeOff aria-hidden className="size-6" strokeWidth={1.75} />
          )}
        </button>
      }
    />
  );
}

/** Вікно «Вхід»: логін і пароль з оком, «Забули пароль?», «ВХІД» і «РЕЄСТРАЦІЯ» */
function LoginForm({ onView }: { onView: (view: View) => void }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    loginActionFn,
    {},
  );
  const e = state.fieldErrors ?? {};
  const v = state.values ?? {};

  return (
    <form action={action} noValidate className="flex flex-col gap-[30px]">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-5">
          {state.formError && (
            <p
              role="alert"
              className="text-[14px] leading-[1.4] text-danger-700"
            >
              {state.formError}
            </p>
          )}
          <UnderlineField
            id="login-username"
            name="username"
            label="Email або номер телефону"
            autoComplete="username"
            defaultValue={v.username}
            error={e.username}
          />
          <PasswordField
            id="login-password"
            name="password"
            label="Пароль"
            autoComplete="current-password"
            error={e.password}
          />
        </div>
        <button
          type="button"
          onClick={() => onView("reset")}
          className="h-10 cursor-pointer self-start px-2 text-[14px] leading-[1.4] text-[#121212] transition-opacity hover:opacity-70 lg:h-auto lg:px-0"
        >
          Забули пароль?
        </button>
      </div>

      <div className="flex gap-2.5 lg:gap-[30px]">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({
            className: "flex-1 cursor-pointer uppercase",
          })}
        >
          {pending ? "Входимо…" : "Вхід"}
        </button>
        <button
          type="button"
          onClick={() => onView("register")}
          className={buttonClasses({
            variant: "outline",
            className: "flex-1 cursor-pointer uppercase",
          })}
        >
          Реєстрація
        </button>
      </div>
    </form>
  );
}

/**
 * Вікно «Реєстрація». Бекенд, крім полів макета, вимагає область і капчу,
 * тому вони додані; тип клієнта — завжди «клієнт».
 */
function RegisterForm({
  onView,
  onRegistered,
}: {
  onView: (view: View) => void;
  /** Реєстрація пройшла: передаємо обрану область, щоб підставити її в профіль */
  onRegistered: (region: string) => void;
}) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    registerAction,
    {},
  );
  const [regions, setRegions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [siteKey, setSiteKey] = useState("");
  const [region, setRegion] = useState(state.values?.region ?? "");
  const e = state.fieldErrors ?? {};
  const v = state.values ?? {};

  useEffect(() => {
    if (state.ok) onRegistered(state.values?.region ?? "");
  }, [state.ok, state.values?.region, onRegistered]);

  useEffect(() => {
    let alive = true;
    registrationOptionsAction().then((o) => {
      if (!alive) return;
      setRegions(o.regions);
      setSiteKey(o.siteKey);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <form action={action} noValidate className="flex flex-col gap-[30px]">
      <input type="hidden" name="type" value="1" />
      <input type="hidden" name="modal" value="1" />
      <div className="flex flex-col gap-5">
        {state.formError && (
          <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
            {state.formError}
          </p>
        )}
        <UnderlineField
          id="reg-fio"
          name="fio"
          label="ПІБ"
          required
          autoComplete="name"
          defaultValue={v.fio}
          error={e.fio}
        />
        <UnderlineField
          id="reg-email"
          name="email"
          type="email"
          label="Email"
          required
          autoComplete="email"
          defaultValue={v.email}
          error={e.email}
        />
        <UnderlineField
          id="reg-phone"
          name="phone"
          type="tel"
          label="Номер телефону"
          required
          autoComplete="tel"
          defaultValue={v.phone}
          error={e.phone}
        />
        <UnderlineSelect
          name="region"
          label="Область"
          required
          searchable
          value={region}
          onChange={setRegion}
          options={regions}
          error={e.region}
        />
        <PasswordField
          id="reg-password"
          name="password"
          label="Пароль"
          required
          autoComplete="new-password"
          error={e.password}
        />
        <PasswordField
          id="reg-password2"
          name="password2"
          label="Повторіть пароль"
          required
          autoComplete="new-password"
          error={e.password2}
        />
        {siteKey && (
          <Recaptcha
            siteKey={siteKey}
            resetKey={state.attempt}
            error={e.captcha}
          />
        )}
      </div>

      <div className="flex flex-col items-center gap-[30px]">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({
            className: "w-full cursor-pointer uppercase lg:w-[240px]",
          })}
        >
          {pending ? "Реєструємо…" : "Зареєструватись"}
        </button>
        <p className="flex h-[42px] items-center gap-2.5 text-[14px] leading-[1.4] lg:h-auto">
          <span className="text-orange">Вже зареєстровані?</span>
          <button
            type="button"
            onClick={() => onView("login")}
            className="cursor-pointer font-semibold text-orange transition-opacity hover:opacity-70 lg:text-[#121212]"
          >
            Увійти
          </button>
        </p>
      </div>
    </form>
  );
}

/** Способи відновлення: бекенд приймає і email, і телефон в одному полі */
const METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Телефон" },
];

/** Вікно «Відновлення паролю»: спосіб, значення й кнопка «Надіслати пароль» */
function ResetForm() {
  const [state, action, pending] = useActionState<ResetFormState, FormData>(
    requestResetAction,
    {},
  );
  const [method, setMethod] = useState("email");
  const [siteKey, setSiteKey] = useState("");
  const e = state.fieldErrors ?? {};

  useEffect(() => {
    let alive = true;
    siteKeyAction().then((k) => alive && setSiteKey(k));
    return () => {
      alive = false;
    };
  }, []);

  if (state.sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-5 text-center text-[#121212]">
        <p className="text-[16px] font-semibold leading-[1.5]">
          Перевірте {method === "email" ? "пошту" : "повідомлення"}
        </p>
        <p className="max-w-[420px] text-[14px] leading-[1.4] text-muted">
          Якщо акаунт із такими даними існує, ми надіслали посилання для
          створення нового пароля. Воно діє обмежений час. Не бачите листа —
          подивіться в теці «Спам».
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-[30px]">
      <div className="flex flex-col gap-5">
        {state.formError && (
          <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
            {state.formError}
          </p>
        )}
        <UnderlineSelect
          name="method"
          label="Відновити за допомогою"
          value={method}
          onChange={setMethod}
          options={METHODS}
        />
        <UnderlineField
          key={method}
          id="reset-login"
          name="login"
          type={method === "email" ? "email" : "tel"}
          label={method === "email" ? "Введіть Email" : "Введіть телефон"}
          autoComplete={method === "email" ? "email" : "tel"}
          defaultValue={state.values?.login}
          error={e.login}
        />
        {siteKey && (
          <Recaptcha
            siteKey={siteKey}
            resetKey={state.attempt}
            error={e.captcha}
          />
        )}
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({
            className: "w-full cursor-pointer lg:w-[240px]",
          })}
        >
          {pending ? "Надсилаємо…" : "Надіслати пароль"}
        </button>
      </div>
    </form>
  );
}

/** Крок «Дані профілю» після реєстрації: поля за макетом, пропустити можна */
function ProfileForm({
  initialRegion,
  onDone,
}: {
  initialRegion: string;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(
    saveProfileDetailsAction,
    {},
  );
  const [options, setOptions] = useState<{
    types: { value: string; label: string }[];
    countries: { value: string; label: string }[];
    regions: { value: string; label: string }[];
  }>({ types: [], countries: [], regions: [] });
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState(initialRegion);
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const loadCities = (regionId: string, regions = options.regions) => {
    const name = regions.find((r) => r.value === regionId)?.label;
    if (!name) return;
    setLoadingCities(true);
    citiesAction(name).then((list) => {
      /* Місто зберігаємо назвою, а не кодом довідника */
      setCities(list.map((c) => ({ value: c.label, label: c.label })));
      setLoadingCities(false);
    });
  };

  useEffect(() => {
    let alive = true;
    profileOptionsAction().then((o) => {
      if (!alive) return;
      setOptions(o);
      setType((cur) => cur || o.types[0]?.value || "");
      setCountry((cur) => cur || o.countries[0]?.value || "");
      if (initialRegion) loadCities(initialRegion, o.regions);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={action} noValidate className="flex flex-col gap-[30px]">
      <div className="flex flex-col gap-[30px]">
        <div className="flex flex-col gap-5">
          {state.formError && (
            <p
              role="alert"
              className="text-[14px] leading-[1.4] text-danger-700"
            >
              {state.formError}
            </p>
          )}
          <UnderlineSelect
            name="type"
            label="Тип"
            value={type}
            onChange={setType}
            options={options.types}
          />
          <UnderlineField id="pf-company" name="company" label="Організація" />
          <UnderlineSelect
            name="country"
            label="Країна"
            value={country}
            onChange={setCountry}
            options={options.countries}
          />
          <UnderlineSelect
            name="region"
            label="Область"
            searchable
            value={region}
            onChange={(next) => {
              setRegion(next);
              setCity("");
              setCities([]);
              loadCities(next);
            }}
            options={options.regions}
          />
          <UnderlineSelect
            name="city"
            label="Місто"
            searchable
            value={city}
            onChange={setCity}
            options={cities}
            disabled={!region}
            loading={loadingCities}
          />
          <UnderlineField
            id="pf-delivery"
            name="deliveryInfo"
            label="Номер складу / вулиця"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({
            className: "w-full cursor-pointer uppercase lg:w-[240px]",
          })}
        >
          {pending ? "Зберігаємо…" : "Зберегти"}
        </button>
      </div>
    </form>
  );
}

const TITLES: Record<View, string> = {
  login: "Вхід",
  reset: "Відновлення паролю",
  register: "Реєстрація",
  profile: "Дані профілю",
};

/** Вікно входу з перемиканням на відновлення пароля, реєстрацію й дані профілю */
function AuthModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [region, setRegion] = useState("");

  /* Після реєстрації користувач уже в системі: закриваємо вікно й ведемо в кабінет */
  const finish = () => {
    onClose();
    router.push("/account");
    router.refresh();
  };

  return (
    <Modal
      title={TITLES[view]}
      subtitle={
        view === "profile" && (
          <button
            type="button"
            onClick={finish}
            className="h-[42px] cursor-pointer px-2.5 text-[14px] font-semibold leading-[1.4] text-orange transition-opacity hover:opacity-70 lg:h-auto lg:px-0"
          >
            Пропустити та заповнити пізніше
          </button>
        )
      }
      compact={view === "register" || view === "profile"}
      onClose={view === "profile" ? finish : onClose}
    >
      {view === "login" && <LoginForm onView={setView} />}
      {view === "reset" && <ResetForm />}
      {view === "register" && (
        <RegisterForm
          onView={setView}
          onRegistered={(r) => {
            setRegion(r);
            setView("profile");
          }}
        />
      )}
      {view === "profile" && (
        <ProfileForm initialRegion={region} onDone={finish} />
      )}
    </Modal>
  );
}

/** Значок профілю для гостя: відкриває вікно входу замість переходу на /login */
export function LoginButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Увійти"
        onClick={() => setOpen(true)}
        className="relative flex shrink-0 cursor-pointer items-center justify-center p-1 transition-opacity hover:opacity-80"
      >
        <ShopIcon name="profile" size={36} className="size-9" />
      </button>
      {open && <AuthModal onClose={() => setOpen(false)} />}
    </>
  );
}
