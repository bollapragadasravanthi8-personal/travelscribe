import { APP_NAME } from "@/lib/constants";

export const siteConfig = {
  name: APP_NAME,
  description:
    "AI-powered travel journal — capture trips, days, photos, and memories.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com/your-org/travelscribe",
  },
} as const;
