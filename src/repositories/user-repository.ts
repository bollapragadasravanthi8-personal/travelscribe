import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function findUserByAuthId(authId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { authId } });
}

type UpsertUserFromAuthInput = {
  authId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

/** Create or update the app user record synced from Supabase Auth. */
export async function upsertUserFromAuth(
  input: UpsertUserFromAuthInput,
): Promise<User> {
  return prisma.user.upsert({
    where: { authId: input.authId },
    create: {
      authId: input.authId,
      email: input.email,
      name: input.name ?? null,
      avatarUrl: input.avatarUrl ?? null,
    },
    update: {
      email: input.email,
      name: input.name ?? null,
      avatarUrl: input.avatarUrl ?? null,
    },
  });
}

/** Alias used by user-service sync helper. */
export const upsertUserByAuthId = upsertUserFromAuth;
