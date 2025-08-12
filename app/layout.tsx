import "../styles/globals.css";
import type { Metadata } from "next";
import { NavBar } from "../components/NavBar";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "HookahPlus",
  description: "The lounge operator stack",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-white">
        <NavBar />
        <main className="min-h-[70vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
