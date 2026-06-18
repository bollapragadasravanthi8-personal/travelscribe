import { env } from "@/lib/env";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { ensureTravelPhotosBucket } from "@/lib/storage/ensure-photo-bucket";
import { createClient } from "@/lib/supabase/server";

export function getPhotoBucket() {
  return env.storage.bucket || STORAGE_BUCKETS.travelPhotos;
}

export function buildPhotoStoragePath(params: {
  authId: string;
  tripId: string;
  dayId: string;
  fileId: string;
  extension: string;
}) {
  const ext = params.extension.toLowerCase().replace(/^\./, "");
  return `${params.authId}/${params.tripId}/${params.dayId}/${params.fileId}.${ext}`;
}

export function getPublicPhotoUrl(storagePath: string) {
  const base = env.supabase.url.replace(/\/$/, "");
  const bucket = getPhotoBucket();
  return `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
}

export async function uploadPhotoFile(storagePath: string, file: File) {
  await ensureTravelPhotosBucket();

  const supabase = await createClient();
  const bucket = getPhotoBucket();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    if (error.message.toLowerCase().includes("bucket not found")) {
      throw new Error(
        `Storage bucket "${bucket}" not found. Create a public bucket named "${bucket}" in Supabase Dashboard → Storage (see README §8), or add SUPABASE_SERVICE_ROLE_KEY to .env.local for automatic setup.`,
      );
    }
    throw new Error(error.message || "Failed to upload photo.");
  }

  return getPublicPhotoUrl(storagePath);
}

export async function deletePhotoFile(storagePath: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(getPhotoBucket())
    .remove([storagePath]);

  if (error) {
    throw new Error(error.message || "Failed to delete photo file.");
  }
}

export function getExtensionFromFile(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) {
    return fromName;
  }

  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return mimeMap[file.type] ?? "jpg";
}
