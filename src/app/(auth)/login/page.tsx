import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import type { SearchParams } from "@/types";

export const metadata: Metadata = {
  title: "Sign In",
};

type LoginPageProps = SearchParams;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : ROUTES.dashboard;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Welcome back. Sign in to continue your travel journal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={ROUTES.signup} className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
