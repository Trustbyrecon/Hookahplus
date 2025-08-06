import Image from 'next/image';
import Link from 'next/link';

export default function PressPage() {
  return (
    <main className="min-h-screen bg-charcoal text-goldLumen p-8 font-sans">
      <h1 className="text-3xl font-display font-bold mb-4">Media Kit</h1>
      <p className="mb-6">Session Reimagined. Loyalty Reinforced.</p>
      <div className="space-y-4">
        <Image src="/assets/branding.svg" alt="Hookah+ Logo" width={200} height={200} />
        <Link
          href="/assets/press-deck.pdf"
          className="underline text-ember"
        >
          Download Press Deck
        </Link>
      </div>
    </main>
  );
}
