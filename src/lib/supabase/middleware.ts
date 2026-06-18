import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { PUBLIC_ROUTES, ROUTES } from "@/lib/constants";
import { env } from "@/lib/env";

function isPublicPath(pathname: string) {
  return (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ) || pathname.startsWith("/api/health")
  );
}

function isAuthPage(pathname: string) {
  return pathname === ROUTES.login || pathname === ROUTES.signup;
}

/**
 * Refreshes the Supabase session and enforces route protection.
 */
export async function updateSession(request: NextRequest) {
  // Skip auth when Supabase is not configured (local scaffold)
  if (!env.supabase.url || !env.supabase.anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Authenticated users should not see login/signup
  if (user && isAuthPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.dashboard;
    return NextResponse.redirect(url);
  }

  // Unauthenticated users must sign in for app routes
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
