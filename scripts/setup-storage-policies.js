/**
 * Applies Supabase Storage RLS policies for travel photo uploads.
 * Requires DIRECT_URL in .env.local
 */
require("dotenv").config({ path: ".env.local" });

const { Client } = require("pg");

const bucket =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "travel-photos";

const policies = [
  {
    name: "Users upload own travel photos",
    drop: `DROP POLICY IF EXISTS "Users upload own travel photos" ON storage.objects;`,
    create: `CREATE POLICY "Users upload own travel photos"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = '${bucket}'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );`,
  },
  {
    name: "Public read travel photos",
    drop: `DROP POLICY IF EXISTS "Public read travel photos" ON storage.objects;`,
    create: `CREATE POLICY "Public read travel photos"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = '${bucket}');`,
  },
  {
    name: "Users delete own travel photos",
    drop: `DROP POLICY IF EXISTS "Users delete own travel photos" ON storage.objects;`,
    create: `CREATE POLICY "Users delete own travel photos"
      ON storage.objects FOR DELETE TO authenticated
      USING (
        bucket_id = '${bucket}'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );`,
  },
];

async function setupStoragePolicies() {
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL in .env.local");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const policy of policies) {
      await client.query(policy.drop);
      await client.query(policy.create);
      console.log(`Applied policy "${policy.name}".`);
    }
    console.log(`Storage RLS policies ready for bucket "${bucket}".`);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  setupStoragePolicies().catch((err) => {
    console.error("Failed to apply storage policies:", err.message);
    process.exit(1);
  });
}

module.exports = { setupStoragePolicies };
