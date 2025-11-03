import type { Metadata } from "next";

export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hookahplus.net";

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "Hookah+ — Lounge Operator Stack",
    template: "%s — Hookah+",
  },
  description: "The Future of Lounge Management Starts Here",
  icons: {
    icon: "/favicon.svg",
  },
};

export const metadata = baseMetadata;
