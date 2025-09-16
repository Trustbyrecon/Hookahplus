// app/layout.tsx
import './globals.css';
import { Suspense } from 'react';
import { SessionProvider } from '../components/SessionContext';
import { ReflexAgentProvider } from '../components/ReflexAgentContext';
import GlobalNavigation from '../components/GlobalNavigation';

export const metadata = {
  title: 'Hookah+ Dashboard',
  description: 'POS System for Hookah Lounge',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body>
        <ReflexAgentProvider>
          <SessionProvider>
            <GlobalNavigation />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
          </SessionProvider>
        </ReflexAgentProvider>
      </body>
    </html>
  );
}
