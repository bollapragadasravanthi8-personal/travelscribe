import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { findTravelDayByIdForUser } from "@/repositories/travel-day-repository";

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
  const day = await findTravelDayByIdForUser(dayId, user.id);

  if (!day) {
    notFound();
  }

  return children;
}
