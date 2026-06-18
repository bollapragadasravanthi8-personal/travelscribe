import type { MetadataRoute } from "next";

import { APP_NAME } from "@/lib/constants";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: siteConfig.description,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171717",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
