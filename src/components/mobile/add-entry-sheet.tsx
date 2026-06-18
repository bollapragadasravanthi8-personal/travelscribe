"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { addNote, type DayActionState } from "@/actions/days";
import { ExpenseForm } from "@/components/expenses/expense-form";
import {
  useMobileApp,
  type QuickAddMode,
} from "@/components/mobile/mobile-app-provider";
import { StickyFormFooter } from "@/components/mobile/sticky-form-footer";
import { UploadPhotoForm } from "@/components/photos/upload-photo-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TripOption = {
  id: string;
  title: string;
};

type DayOption = {
  id: string;
  dayNumber: number;
  title: string | null;
};

type AddEntrySheetProps = {
  trips: TripOption[];
  getDaysForTrip: (tripId: string) => Promise<DayOption[]>;
};

const initialState: DayActionState = {};

type Step = "trip" | "day" | "form";

const modeTitles: Record<QuickAddMode, { pickTrip: string; pickDay: string; form: string }> = {
  memo: {
    pickTrip: "Choose a trip",
    pickDay: "Choose a day",
    form: "Add memo",
  },
  expense: {
    pickTrip: "Choose a trip",
    pickDay: "Choose a day",
    form: "Add expense",
  },
  photo: {
    pickTrip: "Choose a trip",
    pickDay: "Choose a day",
    form: "Upload photo",
  },
};

function resolveInitialStep(context: {
  tripId?: string;
  dayId?: string;
}): Step {
  if (context.tripId && context.dayId) {
    return "form";
  }
  if (context.tripId) {
    return "day";
  }
  return "trip";
}

export function AddEntrySheet({ trips, getDaysForTrip }: AddEntrySheetProps) {
  const {
    isQuickAddOpen,
    quickAddMode,
    quickAddContext,
    closeQuickAdd,
  } = useMobileApp();
  const [step, setStep] = React.useState<Step>("trip");
  const [selectedTripId, setSelectedTripId] = React.useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = React.useState<string | null>(null);
  const [days, setDays] = React.useState<DayOption[]>([]);
  const [loadingDays, setLoadingDays] = React.useState(false);
  const [state, formAction, pending] = useActionState(addNote, initialState);

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId);
  const selectedDay = days.find((day) => day.id === selectedDayId);
  const titles = modeTitles[quickAddMode];

  useEffect(() => {
    if (!isQuickAddOpen) {
      setStep("trip");
      setSelectedTripId(null);
      setSelectedDayId(null);
      setDays([]);
      return;
    }

    const initialStep = resolveInitialStep(quickAddContext);
    setStep(initialStep);
    setSelectedTripId(quickAddContext.tripId ?? null);
    setSelectedDayId(quickAddContext.dayId ?? null);

    if (quickAddContext.tripId) {
      setLoadingDays(true);
      void getDaysForTrip(quickAddContext.tripId)
        .then((nextDays) => setDays(nextDays))
        .finally(() => setLoadingDays(false));
    }
  }, [isQuickAddOpen, quickAddContext, getDaysForTrip]);

  useEffect(() => {
    if (state.success && quickAddMode === "memo") {
      closeQuickAdd();
    }
  }, [state.success, quickAddMode, closeQuickAdd]);

  async function handleTripSelect(tripId: string) {
    setSelectedTripId(tripId);
    setSelectedDayId(null);
    setLoadingDays(true);
    try {
      const nextDays = await getDaysForTrip(tripId);
      setDays(nextDays);
      setStep("day");
    } finally {
      setLoadingDays(false);
    }
  }

  function handleDaySelect(dayId: string) {
    setSelectedDayId(dayId);
    setStep("form");
  }

  function handleBack() {
    if (step === "form") {
      setStep("day");
      setSelectedDayId(null);
      return;
    }
    if (step === "day") {
      setStep("trip");
      setSelectedTripId(null);
      setDays([]);
    }
  }

  return (
    <Sheet open={isQuickAddOpen} onOpenChange={(open) => !open && closeQuickAdd()}>
      <SheetContent side="bottom" className="h-[92dvh] rounded-t-xl p-0">
        <SheetHeader className="border-b px-4 py-4 text-left">
          <div className="flex items-center gap-2">
            {step !== "trip" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleBack}
                aria-label="Go back"
              >
                <ArrowLeft className="size-4" />
              </Button>
            ) : null}
            <div>
              <SheetTitle>
                {step === "trip" && titles.pickTrip}
                {step === "day" && titles.pickDay}
                {step === "form" && titles.form}
              </SheetTitle>
              <SheetDescription>
                {step === "trip" && "Select which trip this entry belongs to"}
                {step === "day" && selectedTrip?.title}
                {step === "form" &&
                  `${selectedTrip?.title} · Day ${selectedDay?.dayNumber ?? ""}`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
          {step === "trip" && (
            <div className="space-y-2">
              {trips.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Create a trip first to add entries.
                </p>
              ) : (
                trips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => void handleTripSelect(trip.id)}
                    disabled={loadingDays}
                    className={cn(
                      "flex w-full items-center rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent",
                      loadingDays && "opacity-60",
                    )}
                  >
                    {trip.title}
                  </button>
                ))
              )}
            </div>
          )}

          {step === "day" && (
            <div className="space-y-2">
              {loadingDays ? (
                <p className="text-sm text-muted-foreground">Loading days…</p>
              ) : days.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add a travel day to this trip first.
                </p>
              ) : (
                days.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleDaySelect(day.id)}
                    className="flex w-full items-center rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent"
                  >
                    Day {day.dayNumber}
                    {day.title ? ` · ${day.title}` : ""}
                  </button>
                ))
              )}
            </div>
          )}

          {step === "form" && selectedTripId && selectedDayId && (
            <>
              {quickAddMode === "memo" && (
                <form action={formAction} className="flex min-h-0 flex-1 flex-col">
                  <input type="hidden" name="tripId" value={selectedTripId} />
                  <input type="hidden" name="dayId" value={selectedDayId} />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-entry-content">Memo</Label>
                      <Textarea
                        id="add-entry-content"
                        name="content"
                        placeholder="What happened today?"
                        required
                        rows={6}
                        className="min-h-32"
                      />
                    </div>
                    {state.error ? (
                      <p className="text-sm text-destructive">{state.error}</p>
                    ) : null}
                  </div>
                  <StickyFormFooter>
                    <Button type="submit" className="h-11 w-full" disabled={pending}>
                      {pending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        "Save memo"
                      )}
                    </Button>
                  </StickyFormFooter>
                </form>
              )}

              {quickAddMode === "expense" && (
                <ExpenseForm
                  mode="create"
                  tripId={selectedTripId}
                  dayId={selectedDayId}
                  onSuccess={closeQuickAdd}
                />
              )}

              {quickAddMode === "photo" && (
                <UploadPhotoForm
                  tripId={selectedTripId}
                  dayId={selectedDayId}
                  onSuccess={closeQuickAdd}
                />
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
