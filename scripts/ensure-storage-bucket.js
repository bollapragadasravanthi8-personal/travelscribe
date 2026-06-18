/**
 * Creates the travel-photos Supabase Storage bucket and RLS policies.
 * Requires SUPABASE_SERVICE_ROLE_KEY and DIRECT_URL in .env.local
 */
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const { setupStoragePolicies } = require("./setup-storage-policies");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "travel-photos";

async function ensureBucket() {
  if (!url || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
    process.exit(1);
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    console.error("Failed to list buckets:", listError.message);
    process.exit(1);
  }

  if (buckets?.some((entry) => entry.name === bucket)) {
    console.log(`Bucket "${bucket}" already exists.`);
    return;
  }

  const { error: createError } = await admin.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });

  if (createError) {
    console.error("Failed to create bucket:", createError.message);
    process.exit(1);
  }

  console.log(`Created public bucket "${bucket}".`);
}

async function main() {
  await ensureBucket();
  await setupStoragePolicies();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
