import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_BYTES,
} from "@/lib/constants";
import { uploadTripCover } from "@/lib/storage/trip-covers";

export async function resolveTripCoverUrl(
  formData: FormData,
  authId: string,
  tripId: string,
): Promise<string | null> {
  const file = formData.get("coverFile");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      throw new Error("Cover image exceeds the maximum upload size.");
    }
    if (
      !ALLOWED_PHOTO_TYPES.includes(
        file.type as (typeof ALLOWED_PHOTO_TYPES)[number],
      )
    ) {
      throw new Error("Unsupported cover image type.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadTripCover({
      authId,
      tripId,
      fileName: file.name,
      contentType: file.type,
      fileBuffer: buffer,
    });
    return uploaded.url;
  }

  const url = String(formData.get("coverImageUrl") ?? "").trim();
  return url || null;
}
