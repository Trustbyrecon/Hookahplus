import type { Metadata } from "next";

export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hookahplus.net";

export const baseMetadata: Metadata = {
  // MUST be a URL object (not a string)
  metadataBase: new URL(siteOrigin),
  title: {
    default: "Hookah+ — Lounge Operator Stack",
    template: "%s — Hookah+",
  },
  description:
    "QR preorders, Stripe checkout, session assistant, and Reflex reliability for modern lounges.",
  openGraph: {
    url: "/",
    siteName: "Hookah+",
    images: [
      { url: "/opengraph-image.png", width: 1200, height: 630, alt: "Hookah+" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image.png"],
  },
  icons: { icon: "/favicon.ico" },
};
