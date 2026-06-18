import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_BYTES,
} from "@/lib/constants";
import { env } from "@/lib/env";
import { getPhotoBucket } from "@/lib/storage/photo-storage";
import { createAdminClient } from "@/lib/supabase/admin";

let bucketReadyPromise: Promise<void> | null = null;

async function createTravelPhotosBucketIfNeeded() {
  const bucket = getPhotoBucket();
  const admin = createAdminClient();

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    throw new Error(listError.message);
  }

  if (buckets?.some((entry) => entry.name === bucket)) {
    return;
  }

  const { error: createError } = await admin.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: MAX_PHOTO_SIZE_BYTES,
    allowedMimeTypes: [...ALLOWED_PHOTO_TYPES],
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(createError.message);
  }
}

/** Ensures the travel-photos bucket exists (requires SUPABASE_SERVICE_ROLE_KEY). */
export async function ensureTravelPhotosBucket() {
  if (!isTravelPhotosBucketConfigured()) {
    return;
  }

  if (!bucketReadyPromise) {
    bucketReadyPromise = createTravelPhotosBucketIfNeeded().catch((err) => {
      bucketReadyPromise = null;
      throw err;
    });
  }

  return bucketReadyPromise;
}

export function isTravelPhotosBucketConfigured() {
  return Boolean(env.supabase.url && env.supabase.serviceRoleKey);
}
