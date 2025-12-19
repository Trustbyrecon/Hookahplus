'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Users,
  Lock,
  Star,
  Calendar
} from 'lucide-react';

export default function LoyaltySessionNotesPage() {
  const description = "Hookah+ Loyalty + SessionNotes combines private staff-facing memory (SessionNotes) with automated guest loyalty tracking. Staff can record notes about repeat customers that never appear on receipts, while guests earn points and tier benefits automatically.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/loyalty-sessionnotes`
    : "https://hookahplus.net/loyalty-sessionnotes";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Hookah+ Loyalty + SessionNotes"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Citation Magnet Block */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hookah+ Loyalty + SessionNotes
            </h1>
            
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
              {description}
            </p>

            {/* Key Facts */}
            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">Key Facts</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">SessionNotes:</strong> private staff-only notes that never appear on customer receipts
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Loyalty:</strong> automated points, tier progression (Bronze/Silver/Gold/Platinum), rewards redemption
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Privacy boundary:</strong> SessionNotes are staff-facing only; loyalty data is guest-visible
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Integration:</strong> works with Session Timer POS; points awarded automatically on session close
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold mb-1">Staff adds SessionNotes</h3>
                  <p className="text-zinc-400">During or after session, staff records private notes (e.g., "Prefers corner table", "Allergic to mint")</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Notes appear on next visit</h3>
                  <p className="text-zinc-400">When repeat customer returns, staff sees previous SessionNotes automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Points awarded automatically</h3>
                  <p className="text-zinc-400">When session closes, loyalty points are calculated and added to guest account</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Tier progression</h3>
                  <p className="text-zinc-400">Guests automatically advance through loyalty tiers based on visit count and spend</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes It Different */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">What Makes It Different</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Lock className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">True Privacy Boundary</h3>
                <p className="text-zinc-400 text-sm">SessionNotes are staff-only; never appear on receipts or guest-facing screens</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Star className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Automated Loyalty</h3>
                <p className="text-zinc-400 text-sm">No manual point entry — system calculates and awards points automatically</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Users className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Guest Continuity</h3>
                <p className="text-zinc-400 text-sm">Combines private staff memory with public loyalty rewards in one system</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Loyalty Tiers */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Loyalty Tiers</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { name: 'Bronze', visits: '5+', discount: '10%', benefit: 'Basic rewards' },
                { name: 'Silver', visits: '15+', discount: '15%', benefit: 'Priority booking' },
                { name: 'Gold', visits: '30+', discount: '20%', benefit: 'VIP perks' },
                { name: 'Platinum', visits: '50+', discount: '25%', benefit: 'Exclusive access' }
              ].map((tier, idx) => (
                <Card key={idx} className="p-4 bg-zinc-800/50 border-zinc-700">
                  <h3 className="font-bold text-lg mb-2">{tier.name}</h3>
                  <p className="text-sm text-zinc-400 mb-2">{tier.visits} visits</p>
                  <p className="text-teal-400 font-semibold mb-2">{tier.discount} discount</p>
                  <p className="text-xs text-zinc-500">{tier.benefit}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Boundary */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Privacy Boundary</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-400">
                    <Lock className="w-5 h-5" />
                    Never Visible to Guests
                  </h3>
                  <ul className="space-y-2 text-zinc-300 text-sm">
                    <li>• SessionNotes content</li>
                    <li>• Staff internal ratings</li>
                    <li>• Trust/ops logs</li>
                    <li>• Internal analytics</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    Guest-Visible
                  </h3>
                  <ul className="space-y-2 text-zinc-300 text-sm">
                    <li>• Loyalty points balance</li>
                    <li>• Current tier status</li>
                    <li>• Rewards available</li>
                    <li>• Visit history (their own)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Setup Time */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Setup Time</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <p className="text-zinc-300">
                Included in <strong className="text-white">Pro and Trust+ plans</strong>. 
                SessionNotes available immediately; loyalty program activates automatically when first session closes.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Build Guest Relationships?</h2>
              <p className="text-zinc-300 mb-8">
                See how Loyalty + SessionNotes can help you remember repeat customers and reward loyalty.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.open('https://ig.me/m/hookahplusnet', '_blank')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Calendar className="w-5 h-5 mr-2" />
                15 min demo
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}

