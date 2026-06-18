import { getAiProvider } from "@/lib/ai";
import type { PhotoCaptionContext } from "@/lib/ai/types";
import { findPhotoByIdForUser, updatePhotoAiCaption } from "@/repositories/photo-repository";

function buildPhotoCaptionPrompt(context: PhotoCaptionContext): string {
  return [
    `Trip: ${context.tripTitle}`,
    context.dayTitle ? `Day: ${context.dayTitle}` : null,
    context.location ? `Location: ${context.location}` : null,
    context.existingCaption
      ? `Existing caption: ${context.existingCaption}`
      : null,
    context.noteContent ? `Related memo: ${context.noteContent}` : null,
    "",
    "Write a short, evocative photo caption (1-2 sentences). Do not use hashtags.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generatePhotoCaptionForUser(
  photoId: string,
  userId: string,
) {
  const photo = await findPhotoByIdForUser(photoId, userId);
  if (!photo) {
    throw new Error("Photo not found.");
  }

  const context: PhotoCaptionContext = {
    tripTitle: photo.travelDay.trip.title,
    dayTitle: photo.travelDay.title,
    location: photo.travelDay.location,
    existingCaption: photo.caption,
    noteContent: photo.note?.content,
  };

  const provider = getAiProvider();
  const result = await provider.generateText({
    systemInstruction: "You write concise, vivid travel photo captions.",
    prompt: buildPhotoCaptionPrompt(context),
    maxOutputTokens: 256,
  });

  await updatePhotoAiCaption(photoId, userId, result.text);
  return result.text;
}
