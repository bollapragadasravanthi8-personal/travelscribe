import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

/**
 * Supabase client for Client Components.
 * Uses the anon key — safe to expose in the browser.
 */
export function createClient() {
  return createBrowserClient(
    env.supabase.url,
    env.supabase.anonKey,
  );
}
