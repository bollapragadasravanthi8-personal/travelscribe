import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { signOut } from "@/actions/auth";
import { InstallPrompt } from "@/components/mobile/install-prompt";
import { PageHeader } from "@/components/common/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Profile",
};

function initials(name: string | null | undefined, email: string) {
  if (name?.trim()) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <>
      <PageHeader title="Profile" description="Your account and app settings." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Signed in to TravelScribe</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-14">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name ?? user.email} />
            ) : null}
            <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name ?? "Traveler"}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      <InstallPrompt />

      <form action={signOut}>
        <Button type="submit" variant="outline" className="h-11 w-full sm:w-auto">
          Sign out
        </Button>
      </form>
    </>
  );
}
