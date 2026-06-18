import Link from "next/link";
import { Map, Plus } from "lucide-react";

import { CreateTripDialog } from "@/components/trips/create-trip-dialog";
import { Button } from "@/components/ui/button";
import { TRAVEL_IMAGES } from "@/lib/constants";

export function DashboardHero() {
  return (
    <section
      className="relative mb-6 overflow-hidden rounded-2xl shadow-md"
      style={{
        backgroundImage: `linear-gradient(135deg, oklch(0.45 0.12 210 / 0.88), oklch(0.55 0.1 190 / 0.75)), url('${TRAVEL_IMAGES.dashboardHero}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative px-5 py-8 text-white md:px-8 md:py-10">
        <p className="mb-1 text-sm font-medium text-white/80">Your travel journal</p>
        <h2 className="max-w-md text-2xl font-bold tracking-tight md:text-3xl">
          Capture every journey, memory, and moment
        </h2>
        <p className="mt-2 max-w-lg text-sm text-white/85">
          Log trips, photos, memos, and expenses — all in one place.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <CreateTripDialog
            trigger={
              <Button className="h-11 bg-white text-primary hover:bg-white/90">
                <Plus className="size-4" />
                New trip
              </Button>
            }
          />
          <Button
            asChild
            variant="outline"
            className="h-11 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/trips">
              <Map className="size-4" />
              Browse trips
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
