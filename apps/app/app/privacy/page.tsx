import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Hookah+',
  description:
    'How Hookah+ handles data for lounge operations, operator tools, and customer experience.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-sm mb-6">
          <Link href="/" className="text-primary underline-offset-4 hover:underline">
            ← Hookah+ home
          </Link>
        </p>

        <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>

        <p className="text-sm text-muted-foreground mb-4">
          Hookah+ (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy.
        </p>

        <p className="text-sm mb-2">We collect minimal data required to operate the platform, including:</p>

        <ul className="text-sm list-disc pl-5 mb-4 space-y-1">
          <li>Session data (tables, orders, timestamps)</li>
          <li>Customer preferences (CLARK memory)</li>
          <li>Operator actions and logs</li>
        </ul>

        <p className="text-sm mb-2">
          We do not sell personal data. Data is used only to improve lounge operations and customer
          experience.
        </p>

        <p className="text-sm mb-2">
          Questions:{' '}
          <a href="mailto:support@hookahplus.net" className="underline underline-offset-4">
            support@hookahplus.net
          </a>
        </p>

        <p className="text-xs text-muted-foreground mt-6">Last updated: April 2026</p>
      </div>
    </main>
  );
}
