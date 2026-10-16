import type { Metadata } from "next";
import { MessagesList } from "@/components/account/messages-list";
import { getInformers } from "@/lib/api/informers";

export const metadata: Metadata = {
  title: "Повідомлення",
  robots: { index: false, follow: false },
};

export default async function AccountMessagesPage() {
  const items = await getInformers();
  return <MessagesList items={items} />;
}
