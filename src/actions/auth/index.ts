"use server";

import { redirect } from "next/navigation";

import { rethrowIfRedirect } from "@/lib/action-errors";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: boolean;
};

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? ROUTES.dashboard);

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to sign in. Please try again." };
  }

  redirect(next.startsWith("/") ? next : ROUTES.dashboard);
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { name, full_name: name } : undefined,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${ROUTES.authCallback}`,
      },
    });
    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to create account. Please try again." };
  }

  redirect(ROUTES.dashboard);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.login);
}
