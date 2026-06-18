import { ROUTES } from "@/lib/constants";

export type NavItemConfig = {
  title: string;
  href: string;
  icon: "dashboard" | "trips" | "expenses" | "profile" | "settings";
  disabled?: boolean;
};

export const mainNavItems: NavItemConfig[] = [
  {
    title: "Home",
    href: ROUTES.dashboard,
    icon: "dashboard",
  },
  {
    title: "Trips",
    href: ROUTES.trips,
    icon: "trips",
  },
  {
    title: "Expenses",
    href: ROUTES.expenses,
    icon: "expenses",
  },
];

export const secondaryNavItems: NavItemConfig[] = [
  {
    title: "Profile",
    href: ROUTES.profile,
    icon: "profile",
  },
];
