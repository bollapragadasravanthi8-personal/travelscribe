import { createClient } from "@supabase/supabase-js";

import { STORAGE_BUCKETS } from "@/lib/constants";
import { env } from "@/lib/env";

function getStorageAdminClient() {
  const url = env.supabase.url;
  const serviceRoleKey = env.supabase.serviceRoleKey;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase storage is not configured.");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getPublicUrl(bucket: string, path: string): string {
  const base = env.supabase.url.replace(/\/$/, "");
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export type UploadTripCoverInput = {
  authId: string;
  tripId: string;
  fileName: string;
  contentType: string;
  fileBuffer: Buffer;
};

export type UploadTripCoverResult = {
  storagePath: string;
  url: string;
};

/** Upload a trip cover image to Supabase Storage under `{authId}/trip-covers/{tripId}/`. */
export async function uploadTripCover(
  input: UploadTripCoverInput,
): Promise<UploadTripCoverResult> {
  const bucket = env.storage.bucket || STORAGE_BUCKETS.travelPhotos;
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${input.authId}/trip-covers/${input.tripId}/${Date.now()}-${safeName}`;

  const supabase = getStorageAdminClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, input.fileBuffer, {
      contentType: input.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Cover upload failed: ${error.message}`);
  }

  return {
    storagePath,
    url: getPublicUrl(bucket, storagePath),
  };
}
