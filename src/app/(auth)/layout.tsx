import Link from "next/link";

import { APP_NAME, ROUTES } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <Link
        href={ROUTES.home}
        className="mb-8 text-xl font-semibold tracking-tight"
      >
        {APP_NAME}
      </Link>
      {children}
    </div>
  );
}
