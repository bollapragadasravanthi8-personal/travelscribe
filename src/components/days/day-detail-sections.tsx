"use client";

import {
  Camera,
  DollarSign,
  FileText,
  Sparkles,
} from "lucide-react";

import { AddExpenseForm } from "@/components/expenses/add-expense-form";
import { ExpenseItem } from "@/components/expenses/expense-item";
import { PhotoGallery } from "@/components/photos/photo-gallery";
import { UploadPhotoForm } from "@/components/photos/upload-photo-form";
import { AiSummarySection } from "@/components/days/ai-summary-section";
import { AddNoteForm } from "@/components/days/add-note-form";
import { NoteItem } from "@/components/days/note-item";
import { EmptyState } from "@/components/common/empty-state";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatCurrency, summarizeExpensesByCurrency } from "@/lib/format";

type DaySectionData = {
  tripId: string;
  dayId: string;
  aiSummary: string | null;
  hasSummaryContent: boolean;
  notes: {
    id: string;
    content: string;
    photos: {
      id: string;
      url: string;
      caption: string | null;
      aiCaption: string | null;
    }[];
  }[];
  photos: {
    id: string;
    url: string;
    caption: string | null;
    aiCaption: string | null;
    note: { id: string; content: string } | null;
  }[];
  expenses: {
    id: string;
    amount: string;
    currency: string;
    category: string | null;
    notes: string | null;
  }[];
};

export function DayDetailSections({ data }: { data: DaySectionData }) {
  const expenseTotals = summarizeExpensesByCurrency(data.expenses);
  const dayPhotos = data.photos.filter((photo) => !photo.note);

  return (
    <Accordion
      type="multiple"
      defaultValue={["notes"]}
      className="w-full rounded-xl border bg-card px-4"
    >
      <AccordionItem value="notes">
        <AccordionTrigger className="min-h-11 touch-target">
          <span className="flex items-center gap-2">
            <FileText className="size-4" />
            Notes & Memos ({data.notes.length})
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          {data.notes.length === 0 ? (
            <EmptyState
              title="No memos yet"
              description="Add your first memo below."
              className="py-6"
            />
          ) : (
            <div className="space-y-3">
              {data.notes.map((note) => (
                <NoteItem
                  key={note.id}
                  tripId={data.tripId}
                  dayId={data.dayId}
                  note={note}
                />
              ))}
            </div>
          )}
          <AddNoteForm tripId={data.tripId} dayId={data.dayId} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="photos">
        <AccordionTrigger className="min-h-11 touch-target">
          <span className="flex items-center gap-2">
            <Camera className="size-4" />
            Photo memories ({dayPhotos.length})
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          {dayPhotos.length === 0 ? (
            <EmptyState
              title="No photo memories yet"
              description="Add extra photos for this day below, or attach photos directly to a memo."
              className="py-6"
            />
          ) : (
            <PhotoGallery
              tripId={data.tripId}
              dayId={data.dayId}
              photos={dayPhotos}
            />
          )}
          <UploadPhotoForm tripId={data.tripId} dayId={data.dayId} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="expenses">
        <AccordionTrigger className="min-h-11 touch-target">
          <span className="flex items-center gap-2">
            <DollarSign className="size-4" />
            Expenses ({data.expenses.length})
            {expenseTotals.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                ·{" "}
                {expenseTotals
                  .map(({ currency, total }) => formatCurrency(total, currency))
                  .join(" · ")}
              </span>
            )}
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          {data.expenses.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              description="Track spending for this day below."
              className="py-6"
            />
          ) : (
            <div className="space-y-3">
              {data.expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  tripId={data.tripId}
                  dayId={data.dayId}
                  expense={expense}
                />
              ))}
            </div>
          )}
          <AddExpenseForm tripId={data.tripId} dayId={data.dayId} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="summary">
        <AccordionTrigger className="min-h-11 touch-target">
          <span className="flex items-center gap-2">
            <Sparkles className="size-4" />
            AI Summary
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <AiSummarySection
            tripId={data.tripId}
            dayId={data.dayId}
            summary={data.aiSummary}
            hasContent={data.hasSummaryContent}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
