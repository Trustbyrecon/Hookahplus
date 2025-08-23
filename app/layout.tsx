// app/layout.tsx
import './globals.css';
import { SessionProvider } from '../components/SessionContext';
import { ReflexAgentProvider } from '../components/ReflexAgentContext';

export const metadata = {
  title: 'Hookah+ Dashboard',
  description: 'POS System for Hookah Lounge',
};

export default function RootLayout({ children }) {
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
            {children}
          </SessionProvider>
        </ReflexAgentProvider>
      </body>
    </html>
  );
}
