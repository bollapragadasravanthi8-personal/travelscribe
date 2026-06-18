import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isTripOwnedByUser } from "@/repositories/trip-repository";

type TripLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
};

/** Ensures trip routes only render for trips owned by the current user. */
export default async function TripLayout({ children, params }: TripLayoutProps) {
  const user = await getCurrentUser();
  const { tripId } = await params;
  const owned = await isTripOwnedByUser(tripId, user.id);

  if (!owned) {
    notFound();
  }

  return children;
}
