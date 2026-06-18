import { redirect } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

/** Returns the Supabase auth user from the current session, or null. */
export async function getSessionUser(): Promise<SupabaseUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Requires an authenticated Supabase session; redirects to login otherwise. */
export async function requireSessionUser(): Promise<SupabaseUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(ROUTES.login);
  }
  return user;
}
