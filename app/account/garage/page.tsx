import type { Metadata } from "next";
import { GarageCars } from "@/components/account/garage-cars";
import { getUserCars } from "@/lib/api/account";

export const metadata: Metadata = {
  title: "Мої авто",
  robots: { index: false, follow: false },
};

export default async function GaragePage() {
  const cars = await getUserCars();
  return <GarageCars cars={cars} />;
}
