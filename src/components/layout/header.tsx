import Link from "next/link";
import { Compass } from "lucide-react";

import { UserMenu } from "@/components/layout/user-menu";
import { APP_NAME } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth/session";

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center border-b border-primary/10 bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:h-14 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Compass className="size-4" />
        </span>
        <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-lg text-transparent">
          {APP_NAME}
        </span>
      </Link>
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <UserMenu
            email={user.email ?? ""}
            name={
              (user.user_metadata?.name as string | undefined) ??
              (user.user_metadata?.full_name as string | undefined)
            }
            avatarUrl={user.user_metadata?.avatar_url as string | undefined}
          />
        ) : null}
      </div>
    </header>
  );
}
