"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Check, Lock, Mail, Phone, Truck, User, X } from "lucide-react";
import { UnderlineSelect } from "@/components/checkout/checkout-fields";
import { ShopIcon } from "@/components/ui/shop-icon";
import { Recaptcha } from "@/components/auth/recaptcha";
import { cn } from "@/lib/cn";
import {
  changePasswordAction,
  type AccountFormState,
} from "@/app/account/actions";
import {
  saveDeliveryAction,
  savePersonalAction,
} from "@/app/account/profile-actions";
import {
  remindPasswordAction,
  type RemindResult,
} from "@/app/account/remind-action";
import type { Profile } from "@/lib/api/account";
import { splitRecipient } from "@/lib/recipient";

type Choice = { value: string; label: string };

const icon = "size-6 shrink-0 text-orange lg:size-8";

/** Заголовок розділу: значок, назва й дія «Редагувати» / «Зберегти» справа */
function SectionHead({
  title,
  icon: Icon,
  editing,
  pending,
  onEdit,
  onCancel,
  showAction = true,
  actionLabel,
}: {
  title: string;
  icon: React.ReactNode;
  editing: boolean;
  pending?: boolean;
  onEdit?: () => void;
  /** Є лише там, де зміни можна відкинути (персональні дані, доставка) */
  onCancel?: () => void;
  showAction?: boolean;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-2 border-line pb-2.5 max-sm:flex-wrap max-sm:gap-y-2.5">
      <div className="flex items-center gap-[7px] lg:gap-2.5">
        {Icon}
        <h2 className="text-[14px] font-semibold leading-[1.4] text-black lg:text-[16px] lg:leading-[1.5]">
          {title}
        </h2>
      </div>
      {showAction &&
        (editing ? (
          <div className="flex items-center gap-2.5 max-sm:w-full max-sm:justify-between lg:gap-5">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex cursor-pointer items-center gap-2.5 text-[14px] font-semibold leading-[1.4] text-[#121212] transition-opacity hover:opacity-70"
              >
                Скасувати
                <X
                  aria-hidden
                  className="size-6 text-orange lg:size-5"
                  strokeWidth={2}
                />
              </button>
            )}
            <button
              type="submit"
              disabled={pending}
              className="flex cursor-pointer items-center gap-2.5 text-[14px] font-semibold leading-[1.4] text-[#121212] transition-opacity hover:opacity-70 disabled:opacity-50"
            >
              {actionLabel ?? "Зберегти"}
              <Check
                aria-hidden
                className="size-6 text-orange lg:size-5"
                strokeWidth={2}
              />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="flex cursor-pointer items-center gap-2.5 text-[14px] font-normal leading-[1.4] text-[#121212] transition-opacity hover:opacity-70 lg:font-semibold"
          >
            Редагувати
            <ShopIcon name="pencil-alt" />
          </button>
        ))}
    </div>
  );
}

/** Рядок «підпис — значення»: у перегляді текст, у редагуванні поле з підкресленням */
function Row({
  label,
  value,
  editing,
  children,
  error,
}: {
  label: string;
  value: string;
  /** Поле для режиму редагування; без нього рядок завжди лише для читання */
  editing?: boolean;
  children?: React.ReactNode;
  error?: string;
}) {
  const edit = editing && children;

  return (
    <div className="flex flex-col gap-1 lg:grid lg:grid-cols-[190px_1fr] lg:items-end lg:gap-x-2.5">
      <p className="text-[14px] leading-[1.4] text-muted max-lg:pl-2 max-lg:pt-0.5 lg:py-1.5">
        {label}
      </p>
      <div
        className={cn(
          "flex min-w-0 flex-col justify-end pb-1 pl-2 pt-0.5 lg:min-h-[54px]",
          edit &&
            (error ? "border-b border-danger-500" : "border-b border-orange"),
        )}
      >
        {edit ? (
          children
        ) : (
          <p className="break-words text-[16px] font-semibold leading-[1.5] text-black">
            {value || "—"}
          </p>
        )}
      </div>
      {error && edit && (
        <p
          role="alert"
          className="text-[13px] leading-[1.4] text-danger-700 lg:col-start-2 lg:pl-2"
        >
          {error}
        </p>
      )}
    </div>
  );
}

const control =
  "h-6 w-full bg-transparent text-[16px] font-semibold leading-6 text-black outline-none";

function TextInput({
  name,
  defaultValue,
  type = "text",
  autoComplete,
}: {
  name: string;
  defaultValue: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      defaultValue={defaultValue}
      autoComplete={autoComplete}
      className={control}
    />
  );
}

function SelectInput({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: Choice[];
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <UnderlineSelect
      inline
      name={name}
      label={label}
      value={value}
      onChange={setValue}
      options={options}
    />
  );
}

const dateText = (iso: string | null) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
};

/** Спільна поведінка розділу з режимом перегляду/редагування */
function useSection(
  action: (prev: AccountFormState, data: FormData) => Promise<AccountFormState>,
) {
  const [state, formAction, pending] = useActionState<
    AccountFormState,
    FormData
  >(action, {});
  /* Режим редагування живе, доки не прийшла відповідь сервера: нова відповідь — новий об'єкт */
  const [openedFor, setOpenedFor] = useState<AccountFormState | null>(null);
  const [dismissedFor, setDismissedFor] = useState<AccountFormState | null>(
    null,
  );
  const editing = openedFor === state;
  const setEditing = (on: boolean) => {
    setOpenedFor(on ? state : null);
    /* Нове «Редагувати» знімає попереднє «Скасувати», інакше розділ не відкриється */
    if (on) setDismissedFor(null);
  };
  const cancel = () => {
    setOpenedFor(null);
    setDismissedFor(state);
  };

  /* Помилка зі збереження лишає форму відкритою, поки її не скасують */
  const open =
    dismissedFor !== state &&
    (editing || Boolean(state.fieldErrors || state.formError));
  return { state, formAction, pending, open, setEditing, cancel };
}

function PersonalSection({
  profile,
  userTypeLabel,
  canChangeEmail,
}: {
  profile: Profile;
  userTypeLabel: string;
  canChangeEmail: boolean;
}) {
  const { state, formAction, pending, open, setEditing, cancel } =
    useSection(savePersonalAction);
  const e = state.fieldErrors ?? {};
  const fio =
    [profile.lastName, profile.firstName, profile.fatherName]
      .filter(Boolean)
      .join(" ") ||
    profile.fullName ||
    "";

  return (
    <form action={formAction} noValidate className="flex min-w-0 flex-col">
      <SectionHead
        title="Персональні дані"
        icon={<User aria-hidden className={icon} strokeWidth={1.5} />}
        editing={open}
        pending={pending}
        onEdit={() => setEditing(true)}
        onCancel={cancel}
      />
      {state.formError && (
        <p
          role="alert"
          className="pt-2.5 text-[14px] leading-[1.4] text-danger-700"
        >
          {state.formError}
        </p>
      )}
      <div className="flex flex-col gap-[15px] pt-2.5 lg:gap-[5px] lg:pt-0.5">
        <Row
          label="Контактна особа (ПІБ):"
          value={fio}
          editing={open}
          error={e.fio}
        >
          <TextInput name="fio" defaultValue={fio} autoComplete="name" />
        </Row>
        <Row label="Організація:" value={profile.company} editing={open}>
          <TextInput name="company" defaultValue={profile.company} />
        </Row>
        <Row
          label="Телефон:"
          value={profile.phone ?? ""}
          editing={open}
          error={e.phone}
        >
          <TextInput
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={profile.phone ?? ""}
          />
        </Row>
        <Row
          label="Дата народження:"
          value={dateText(profile.birthday)}
          editing={open}
        >
          <TextInput
            name="birthday"
            type="date"
            defaultValue={profile.birthday ?? ""}
          />
        </Row>
        <Row
          label="Email:"
          value={profile.email}
          editing={open && canChangeEmail}
          error={e.email}
        >
          <TextInput
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={profile.email}
          />
        </Row>
        <Row label="Статус:" value={userTypeLabel} />
        <Row label="Ваш менеджер:" value={profile.manager?.fullName ?? ""} />
        <Row label="Ваш ID:" value={profile.number ?? ""} />
      </div>
    </form>
  );
}

function DeliverySection({
  profile,
  countries,
  regions,
  payMethods,
  deliveries,
}: {
  profile: Profile;
  countries: Choice[];
  regions: Choice[];
  payMethods: Choice[];
  deliveries: Choice[];
}) {
  const { state, formAction, pending, open, setEditing, cancel } =
    useSection(saveDeliveryAction);
  const recipient = splitRecipient(profile.recipient);

  return (
    <form action={formAction} noValidate className="flex min-w-0 flex-col">
      <SectionHead
        title="Дані доставки"
        icon={<Truck aria-hidden className={icon} strokeWidth={1.5} />}
        editing={open}
        pending={pending}
        onEdit={() => setEditing(true)}
        onCancel={cancel}
      />
      {state.formError && (
        <p
          role="alert"
          className="pt-2.5 text-[14px] leading-[1.4] text-danger-700"
        >
          {state.formError}
        </p>
      )}
      <div className="flex flex-col gap-[15px] pt-2.5 lg:gap-[5px] lg:pt-0.5">
        <Row label="Одержувач:" value={recipient.name} editing={open}>
          <TextInput name="recipient" defaultValue={recipient.name} />
        </Row>
        <Row label="Телефон одержувача:" value={recipient.phone} editing={open}>
          <TextInput
            name="recipientPhone"
            type="tel"
            autoComplete="off"
            defaultValue={recipient.phone}
          />
        </Row>
        <Row label="Країна:" value={profile.countryName ?? ""} editing={open}>
          <SelectInput
            name="country"
            label="Країна"
            defaultValue={profile.countryId ?? ""}
            options={countries}
          />
        </Row>
        <Row label="Область:" value={profile.regionName ?? ""} editing={open}>
          <SelectInput
            name="region"
            label="Область"
            defaultValue={profile.regionId ?? ""}
            options={regions}
          />
        </Row>
        <Row label="Населений пункт:" value={profile.city} editing={open}>
          <TextInput name="city" defaultValue={profile.city} />
        </Row>
        <Row label="Адреса:" value={profile.address} editing={open}>
          <TextInput name="address" defaultValue={profile.address} />
        </Row>
        <Row
          label="Спосіб оплати:"
          value={profile.payMethodName ?? ""}
          editing={open}
        >
          <SelectInput
            name="payMethod"
            label="Спосіб оплати"
            defaultValue={profile.payMethodId ?? ""}
            options={payMethods}
          />
        </Row>
        <Row
          label="Перевізник:"
          value={profile.deliveryName ?? ""}
          editing={open}
        >
          <SelectInput
            name="delivery"
            label="Перевізник"
            defaultValue={profile.deliveryId ?? ""}
            options={deliveries}
          />
        </Row>
        <Row
          label="Номер складу / вулиця:"
          value={profile.deliveryInfo}
          editing={open}
        >
          <TextInput name="deliveryInfo" defaultValue={profile.deliveryInfo} />
        </Row>
      </div>
    </form>
  );
}

/** Поле пароля в нижньому розділі: підпис ліворуч, поле з підкресленням праворуч */
function PasswordField({
  name,
  label,
  placeholder,
  error,
}: {
  name: string;
  label: string;
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[190px_1fr] lg:items-center lg:gap-x-2.5">
      <label
        htmlFor={name}
        className="text-[14px] leading-[1.4] text-black max-lg:py-1.5 lg:text-muted"
      >
        {label}
      </label>
      <div className="flex flex-col gap-1.5">
        <div
          className={cn(
            "flex flex-col gap-1 border-b pb-1 pl-2 pt-0.5",
            error ? "border-danger-500" : "border-orange",
          )}
        >
          <input
            id={name}
            name={name}
            type="password"
            autoComplete={
              name === "oldPassword" ? "current-password" : "new-password"
            }
            placeholder={placeholder}
            aria-invalid={error ? true : undefined}
            className="h-[44px] w-full bg-transparent text-[14px] leading-[1.4] text-black outline-none placeholder:text-muted"
          />
        </div>
        {error && (
          <p
            role="alert"
            className="pl-2 text-[13px] leading-[1.4] text-danger-700"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function PasswordSection({
  email,
  phone,
  siteKey,
}: {
  email: string | null;
  phone: string | null;
  siteKey: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [channel, setChannel] = useState<"email" | "phone" | null>(null);
  const [sending, startSending] = useTransition();
  const [result, setResult] = useState<RemindResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  const pick = (next: "email" | "phone") => {
    setChannel((current) => (current === next ? null : next));
    setResult(null);
  };

  /* Токен капчі лежить у прихованому полі віджета всередині форми */
  const send = () => {
    if (!channel) return;
    const token = String(
      new FormData(formRef.current ?? undefined).get("captcha") ?? "",
    );
    startSending(async () => {
      setResult(await remindPasswordAction(channel, token));
      setAttempt((n) => n + 1);
    });
  };

  const remindButton =
    "flex cursor-pointer items-center gap-2.5 py-1 text-[12px] max-lg:px-[5px] max-lg:py-[11px] font-semibold leading-[1.33] text-black transition-opacity hover:opacity-70";

  const [state, action, pending] = useActionState<AccountFormState, FormData>(
    changePasswordAction,
    {},
  );
  const e = state.fieldErrors ?? {};

  return (
    <form
      ref={formRef}
      key={state.ok ? "done" : "edit"}
      action={action}
      noValidate
      className="flex min-w-0 flex-col gap-[30px]"
    >
      <SectionHead
        title="Зміна паролю"
        icon={<Lock aria-hidden className={icon} strokeWidth={1.5} />}
        editing
        pending={pending}
      />

      <div className="-mt-5 flex flex-col gap-2.5">
        {state.formError && (
          <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
            {state.formError}
          </p>
        )}
        {state.ok && (
          <p
            aria-live="polite"
            className="text-[14px] leading-[1.4] text-shop-green"
          >
            Пароль змінено
          </p>
        )}

        <PasswordField
          name="oldPassword"
          label="Поточний пароль:"
          placeholder="Введіть поточний пароль"
          error={e.oldPassword}
        />
        {/* Забули поточний — запит відновлення за email чи телефоном */}
        <div className="flex items-start gap-x-10 gap-y-0 max-lg:flex-col lg:flex-wrap lg:items-center lg:gap-y-1 lg:pl-[200px]">
          {email && (
            <button
              type="button"
              onClick={() => pick("email")}
              aria-expanded={channel === "email"}
              className={remindButton}
            >
              <Mail
                aria-hidden
                className="size-6 text-orange"
                strokeWidth={1.5}
              />
              Нагадати на email
            </button>
          )}
          {phone && (
            <button
              type="button"
              onClick={() => pick("phone")}
              aria-expanded={channel === "phone"}
              className={remindButton}
            >
              <Phone
                aria-hidden
                className="size-6 text-orange"
                strokeWidth={1.5}
              />
              Нагадати на номер телефону
            </button>
          )}
        </div>

        {channel && (
          <div className="flex flex-col items-start gap-3 lg:pl-[200px]">
            {result && "ok" in result ? (
              <p
                aria-live="polite"
                className="text-[14px] leading-[1.4] text-shop-green"
              >
                {channel === "email"
                  ? `Лист із посиланням для відновлення надіслано на ${result.target}`
                  : `SMS із вашим логіном надіслано на номер ${result.target}`}
              </p>
            ) : (
              <>
                <p className="text-[14px] leading-[1.4] text-black">
                  {channel === "email"
                    ? "Надішлемо лист із посиланням для скидання пароля."
                    : "Надішлемо SMS із вашим логіном для входу."}
                </p>
                <Recaptcha siteKey={siteKey} resetKey={attempt} />
                {result && "error" in result && (
                  <p
                    role="alert"
                    className="text-[14px] leading-[1.4] text-danger-700"
                  >
                    {result.error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={send}
                  disabled={sending}
                  className="h-[42px] cursor-pointer rounded-[4px] border border-orange px-5 text-[14px] font-semibold uppercase leading-[1.4] text-orange transition-colors hover:bg-orange hover:text-white disabled:cursor-default disabled:opacity-60"
                >
                  {sending ? "Надсилаємо…" : "Надіслати"}
                </button>
              </>
            )}
          </div>
        )}

        <PasswordField
          name="newPassword"
          label="Новий пароль:"
          placeholder="Введіть новий пароль"
          error={e.newPassword}
        />
        <PasswordField
          name="newPassword2"
          label="Повторіть новий пароль:"
          placeholder="Повторіть новий пароль"
          error={e.newPassword2}
        />
      </div>
    </form>
  );
}

/**
 * Профіль за макетом: «Персональні дані» і «Дані доставки» поруч,
 * нижче ліворуч «Зміна паролю». Кожен блок редагується окремо.
 */
export function ProfileSections({
  profile,
  canChangeEmail,
  userTypeLabel,
  countries,
  regions,
  payMethods,
  deliveries,
  siteKey,
}: {
  profile: Profile;
  /** Ключ reCAPTCHA для «Нагадати пароль» */
  siteKey: string;
  /** Бекенд дозволяє клієнту міняти email (canUserChangeEmail) */
  canChangeEmail: boolean;
  userTypeLabel: string;
  countries: Choice[];
  regions: Choice[];
  payMethods: Choice[];
  deliveries: Choice[];
}) {
  return (
    <div className="flex flex-col gap-[50px]">
      <div className="grid gap-[50px] lg:grid-cols-2 lg:gap-x-[100px]">
        <PersonalSection
          profile={profile}
          userTypeLabel={userTypeLabel}
          canChangeEmail={canChangeEmail}
        />
        <DeliverySection
          profile={profile}
          countries={countries}
          regions={regions}
          payMethods={payMethods}
          deliveries={deliveries}
        />
      </div>
      <div className="lg:w-[calc(50%-50px)]">
        <PasswordSection
          email={profile.email || null}
          phone={profile.phone}
          siteKey={siteKey}
        />
      </div>
    </div>
  );
}
