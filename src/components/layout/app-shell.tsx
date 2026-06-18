import { Header } from "@/components/layout/header";
import { MobileChrome } from "@/components/layout/mobile-chrome";
import {
  mainNavItems,
  secondaryNavItems,
} from "@/components/layout/nav-items";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { listTripTitlesForUser } from "@/services/trip-service";

type AppShellProps = {
  children: React.ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const user = await getCurrentUser();
  const trips = await listTripTitlesForUser(user.id);
  const tripOptions = trips;
  const navItems = [...mainNavItems, ...secondaryNavItems];

  return (
    <MobileChrome trips={tripOptions}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar items={navItems} />
          <MobileShell className="flex-1">
            <main className="mobile-page flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </MobileShell>
        </div>
      </div>
    </MobileChrome>
  );
}
