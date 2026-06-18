import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isTravelDayOwnedByUser } from "@/repositories/travel-day-repository";

type TravelDayLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ tripId: string; dayId: string }>;
};

/** Ensures travel day routes only render for days owned by the current user. */
export default async function TravelDayLayout({
  children,
  params,
}: TravelDayLayoutProps) {
  const user = await getCurrentUser();
  const { dayId } = await params;
  const owned = await isTravelDayOwnedByUser(dayId, user.id);

  if (!owned) {
    notFound();
  }

  return children;
}
