import type { Metadata } from "next";
import { Map } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { CreateTripDialog } from "@/components/trips/create-trip-dialog";
import { TripCard } from "@/components/trips/trip-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { listTripsForUser } from "@/services/trip-service";
import { OfflinePageCache } from "@/components/mobile/offline-page-cache";
import { toOfflineTripSnapshot } from "@/lib/offline/serialize";

export const metadata: Metadata = {
  title: "Trips",
};

export default async function TripsPage() {
  const user = await getCurrentUser();
  const trips = await listTripsForUser(user.id);

  return (
    <>
      <OfflinePageCache
        trips={trips.map((trip) =>
          toOfflineTripSnapshot({
            id: trip.id,
            title: trip.title,
            country: trip.country,
            startDate: trip.startDate,
            endDate: trip.endDate,
            coverImageUrl: trip.coverImageUrl,
          }),
        )}
      />
      <PageHeader
        title="Trips"
        description="Browse and manage all your travel journals."
      >
        <CreateTripDialog />
      </PageHeader>

      {trips.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No trips yet"
          description="Create your first trip to start capturing travel memories, notes, and photos."
        >
          <CreateTripDialog
            trigger={
              <Button>
                Create Trip
              </Button>
            }
          />
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={{
                ...trip,
                _count: { days: trip._count.days, photos: trip.photoCount },
                photoCount: trip.photoCount,
                expenseCount: trip.expenseCount,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
