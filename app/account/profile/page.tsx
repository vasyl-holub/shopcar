import type { Metadata } from "next";
import { ProfileSections } from "@/components/account/profile-sections";
import {
  canChangeEmail,
  getProfile,
  getUserTypeLabels,
} from "@/lib/api/account";
import { getOrderOptions } from "@/lib/api/cart";
import { getSiteKey } from "@/lib/api/auth";
import { profileOptionsAction } from "@/app/account/profile-details-action";

export const metadata: Metadata = {
  title: "Профіль",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const [profile, options, orderOptions, typeLabels, emailEditable, siteKey] =
    await Promise.all([
      getProfile(),
      profileOptionsAction(),
      getOrderOptions(),
      getUserTypeLabels(),
      canChangeEmail(),
      getSiteKey(),
    ]);

  if (!profile) {
    return (
      <p className="text-[16px] leading-[1.6] text-muted">
        Не вдалося завантажити профіль. Оновіть сторінку або спробуйте пізніше.
      </p>
    );
  }

  return (
    <ProfileSections
      profile={profile}
      canChangeEmail={emailEditable}
      siteKey={siteKey}
      userTypeLabel={typeLabels[String(profile.userType)] ?? ""}
      countries={options.countries}
      regions={options.regions}
      payMethods={orderOptions.payMethods.map((p) => ({
        value: p.id,
        label: p.name,
      }))}
      deliveries={orderOptions.deliveries.map((d) => ({
        value: d.id,
        label: d.name,
      }))}
    />
  );
}
