import "./globals.css";
import type { Metadata } from "next";
import { baseMetadata } from "./metadata";

export const metadata: Metadata = baseMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
