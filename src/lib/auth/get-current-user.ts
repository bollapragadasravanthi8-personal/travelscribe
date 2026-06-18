import { cache } from "react";

import type { User } from "@/generated/prisma/client";

import { requireSessionUser } from "@/lib/auth/session";
import {
  findUserByAuthId,
  upsertUserFromAuth,
} from "@/repositories/user-repository";

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}

/** Resolve the Prisma user for the current Supabase session, creating if needed. */
export const getCurrentUser = cache(async (): Promise<User> => {
  const sessionUser = await requireSessionUser();

  const existing = await findUserByAuthId(sessionUser.id);
  if (existing) {
    return existing;
  }

  const email = sessionUser.email;
  if (!email) {
    throw new Error("Authenticated user is missing an email address.");
  }

  return upsertUserFromAuth({
    authId: sessionUser.id,
    email,
    name:
      readMetadataString(sessionUser.user_metadata, "name") ??
      readMetadataString(sessionUser.user_metadata, "full_name"),
    avatarUrl: readMetadataString(sessionUser.user_metadata, "avatar_url"),
  });
});
