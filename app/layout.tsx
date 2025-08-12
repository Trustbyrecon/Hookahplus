 codex/apply-moodbook-to-all-pages-on-hookahplus
import "../styles/globals.css";
import { NavBar } from "../components/NavBar";
import { SiteFooter } from "../components/SiteFooter";
=======
// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HookahPlus",
  description: "The lounge operator stack",
};
 main

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
 codex/apply-moodbook-to-all-pages-on-hookahplus
      <body className="bg-bg text-white">
        <NavBar />
        <main className="min-h-[70vh]">{children}</main>
        <SiteFooter />
      </body>

      <body className="bg-bg text-white">{children}</body>
 main
    </html>
  );
}
