import { formatDateRange } from "@/lib/format";
import { getAiProvider } from "@/lib/ai";
import type { TripStoryContext } from "@/lib/ai/types";
import { findTripWithStoryContextForUser, updateTripAiStory } from "@/repositories/trip-repository";

function buildTripStoryPrompt(context: TripStoryContext): string {
  const daySections = context.days.map((day) => {
    const header = `Day ${day.dayNumber}${day.title ? ` — ${day.title}` : ""}`;
    const lines = [
      header,
      day.location ? `Location: ${day.location}` : null,
      day.aiSummary ? `Summary: ${day.aiSummary}` : null,
      day.notes.length > 0
        ? `Notes:\n${day.notes.map((n) => `- ${n}`).join("\n")}`
        : null,
      day.photoCaptions.length > 0
        ? `Photos:\n${day.photoCaptions.map((c) => `- ${c}`).join("\n")}`
        : null,
    ].filter(Boolean);
    return lines.join("\n");
  });

  return [
    `Trip: ${context.tripTitle}`,
    context.country ? `Country: ${context.country}` : null,
    context.dateRange ? `Dates: ${context.dateRange}` : null,
    context.description ? `Description: ${context.description}` : null,
    "",
    ...daySections,
    "",
    "Write a cohesive travel narrative for the entire trip in 4-8 paragraphs.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateTripStoryForUser(tripId: string, userId: string) {
  const trip = await findTripWithStoryContextForUser(tripId, userId);
  if (!trip) {
    throw new Error("Trip not found.");
  }

  const context: TripStoryContext = {
    tripTitle: trip.title,
    country: trip.country,
    dateRange: formatDateRange(trip.startDate, trip.endDate) ?? undefined,
    description: trip.description,
    days: trip.days.map((day) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      location: day.location,
      aiSummary: day.aiSummary,
      notes: day.notes.map((note) => note.content),
      photoCaptions: day.photos
        .map((photo) => photo.caption ?? photo.aiCaption)
        .filter((value): value is string => Boolean(value?.trim())),
    })),
  };

  const provider = getAiProvider();
  const result = await provider.generateText({
    systemInstruction:
      "You are a travel storyteller. Write an engaging first-person trip narrative.",
    prompt: buildTripStoryPrompt(context),
    maxOutputTokens: 2048,
  });

  await updateTripAiStory(tripId, userId, result.text);
  return result.text;
}
