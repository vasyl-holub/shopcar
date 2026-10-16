import { redirect } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { AccountNav } from "@/components/account/nav";
import { getCurrentUser } from "@/lib/api/auth";

/**
 * Охорона стоїть у layout, тому кожен вкладений розділ кабінету
 * захищений автоматично — на сторінках лишається тільки їхня робота.
 */
export default async function AccountLayout({
  children,
}: LayoutProps<"/account">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <PageContainer className="flex flex-col gap-[30px] pb-10 pt-5 lg:pt-10">
      <h1 className="sr-only">Кабінет</h1>
      <AccountNav />
      <div className="min-w-0">{children}</div>
    </PageContainer>
  );
}
