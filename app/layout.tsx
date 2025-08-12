import { NavBar, SiteFooter } from "../components/NavFooter";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <NavBar />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
