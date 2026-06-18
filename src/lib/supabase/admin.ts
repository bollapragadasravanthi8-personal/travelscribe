import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

/** Supabase client with service role — server-only, never expose to the browser. */
export function createAdminClient() {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    throw new Error("Supabase admin client is not configured.");
  }

  return createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
