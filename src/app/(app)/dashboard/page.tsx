import type { Metadata } from "next";
import Link from "next/link";
import { Map, Plus } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import {
  DashboardStats,
  RecentActivity,
} from "@/components/dashboard/dashboard-stats";
import { CreateTripDialog } from "@/components/trips/create-trip-dialog";
import { TripCard } from "@/components/trips/trip-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { getDashboardOverviewForUser } from "@/services/dashboard-service";
import { OfflinePageCache } from "@/components/mobile/offline-page-cache";
import { toOfflineTripSnapshot } from "@/lib/offline/serialize";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const { stats, trips, recentDays, expenseTotals } =
    await getDashboardOverviewForUser(user.id);

  const recentTrips = trips.slice(0, 3);

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
        title="Dashboard"
        description="Overview of your travel journals and recent activity."
      />

      <DashboardHero />

      <DashboardStats
        tripCount={stats.tripCount}
        travelDayCount={stats.travelDayCount}
        photoCount={stats.photoCount}
        expenseCount={stats.expenseCount}
        expenseTotals={expenseTotals}
      />

      <RecentActivity days={recentDays} />

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Trips</h2>
          {stats.tripCount > 0 && (
            <Link
              href={ROUTES.trips}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {recentTrips.length === 0 ? (
          <EmptyState
            icon={Map}
            title="No trips yet"
            description="Create your first trip to start capturing travel memories."
          >
            <CreateTripDialog
              trigger={
                <Button>
                  <Plus className="size-4" />
                  New Trip
                </Button>
              }
            />
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {recentTrips.map((trip) => (
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
      </section>
    </>
  );
}
