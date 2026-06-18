import { formatDisplayDate } from "@/lib/format";
import { getAiProvider } from "@/lib/ai";
import type { DaySummaryContext } from "@/lib/ai/types";
import { updateTravelDayAiSummary } from "@/repositories/travel-day-repository";
import { findTravelDayByIdForUser } from "@/repositories/travel-day-repository";

function buildDaySummaryPrompt(context: DaySummaryContext): string {
  const lines = [
    `Trip: ${context.tripTitle}`,
    `Day ${context.dayNumber}${context.dayTitle ? ` — ${context.dayTitle}` : ""}`,
    context.date ? `Date: ${context.date}` : null,
    context.location ? `Location: ${context.location}` : null,
    "",
    "Notes:",
    ...(context.notes.length > 0 ? context.notes.map((n) => `- ${n}`) : ["- (none)"]),
    "",
    "Photo captions:",
    ...(context.photoCaptions.length > 0
      ? context.photoCaptions.map((c) => `- ${c}`)
      : ["- (none)"]),
    "",
    "Expenses:",
    ...(context.expenses.length > 0
      ? context.expenses.map(
          (e) =>
            `- ${e.amount} ${e.currency}${e.category ? ` (${e.category})` : ""}`,
        )
      : ["- (none)"]),
    "",
    "Write a warm, concise travel journal summary for this day in 2-4 paragraphs.",
  ];
  return lines.filter((line) => line !== null).join("\n");
}

export async function generateDaySummaryForUser(dayId: string, userId: string) {
  const day = await findTravelDayByIdForUser(dayId, userId);
  if (!day) {
    throw new Error("Travel day not found.");
  }

  const context: DaySummaryContext = {
    tripTitle: day.trip.title,
    dayNumber: day.dayNumber,
    dayTitle: day.title,
    date: formatDisplayDate(day.date),
    location: day.location,
    notes: day.notes.map((note) => note.content),
    photoCaptions: day.photos
      .map((photo) => photo.caption ?? photo.aiCaption)
      .filter((value): value is string => Boolean(value?.trim())),
    expenses: day.expenses.map((expense) => ({
      amount: expense.amount.toString(),
      currency: expense.currency,
      category: expense.category,
    })),
  };

  const provider = getAiProvider();
  const result = await provider.generateText({
    systemInstruction:
      "You are a thoughtful travel journal assistant. Write in first person as the traveler.",
    prompt: buildDaySummaryPrompt(context),
  });

  await updateTravelDayAiSummary(dayId, userId, result.text);
  return result.text;
}
