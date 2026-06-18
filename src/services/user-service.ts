import type { User as SupabaseUser } from "@supabase/supabase-js";

import { upsertUserByAuthId } from "@/repositories/user-repository";

/** Sync Supabase Auth user to Prisma User on sign-in / sign-up / callback. */
export async function syncUserFromAuth(authUser: SupabaseUser) {
  if (!authUser.email) {
    throw new Error("Authenticated user is missing an email address.");
  }

  return upsertUserByAuthId({
    authId: authUser.id,
    email: authUser.email,
    name:
      (authUser.user_metadata?.name as string | undefined) ??
      (authUser.user_metadata?.full_name as string | undefined) ??
      null,
    avatarUrl:
      (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
  });
}
