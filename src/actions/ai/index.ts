"use server";

import { revalidatePath } from "next/cache";

import { rethrowIfRedirect } from "@/lib/action-errors";
import { formatAiError } from "@/lib/ai/format-ai-error";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROUTES } from "@/lib/constants";
import { generateDaySummaryForUser } from "@/services/day-summary-service";
import { generatePhotoCaptionForUser } from "@/services/photo-caption-service";
import { generateTripStoryForUser } from "@/services/trip-story-service";

export type AiActionState = {
  error?: string;
  success?: boolean;
  text?: string;
  story?: string;
  summary?: string;
  caption?: string;
};

export async function generateDaySummary(
  _prevState: AiActionState,
  formData: FormData,
): Promise<AiActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const dayId = String(formData.get("dayId") ?? "").trim();
  if (!tripId || !dayId) {
    return { error: "Travel day not found." };
  }

  try {
    const user = await getCurrentUser();
    const summary = await generateDaySummaryForUser(dayId, user.id);
    revalidatePath(ROUTES.travelDay(tripId, dayId));
    revalidatePath(ROUTES.trip(tripId));
    return { success: true, summary, text: summary };
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: formatAiError(error, "Unable to generate day summary. Please try again."),
    };
  }
}

export async function generatePhotoCaption(
  _prevState: AiActionState,
  formData: FormData,
): Promise<AiActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const dayId = String(formData.get("dayId") ?? "").trim();
  const photoId = String(formData.get("photoId") ?? "").trim();
  if (!tripId || !dayId || !photoId) {
    return { error: "Photo not found." };
  }

  try {
    const user = await getCurrentUser();
    const caption = await generatePhotoCaptionForUser(photoId, user.id);
    revalidatePath(ROUTES.travelDay(tripId, dayId));
    return { success: true, caption, text: caption };
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: formatAiError(error, "Unable to generate photo caption. Please try again."),
    };
  }
}

export async function generateTripStory(
  _prevState: AiActionState,
  formData: FormData,
): Promise<AiActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  if (!tripId) {
    return { error: "Trip not found." };
  }

  try {
    const user = await getCurrentUser();
    const story = await generateTripStoryForUser(tripId, user.id);
    revalidatePath(ROUTES.trip(tripId));
    return { success: true, story, text: story };
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: formatAiError(error, "Unable to generate trip story. Please try again."),
    };
  }
}
