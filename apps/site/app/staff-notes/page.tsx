'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle, 
  Calendar,
  Lock,
  Users,
  Eye,
  ArrowRight
} from 'lucide-react';

export default function StaffNotesPage() {
  const description = "Hookah+ Staff Notes allow your team to record private, staff-facing notes about customers that never appear on receipts. Remember preferences, allergies, service context, and behavioral patterns.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/staff-notes`
    : "https://hookahplus.net/staff-notes";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Staff Notes"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Staff Notes</h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">{description}</p>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">Key Features</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Private Notes:</strong> Staff-only notes that never appear on customer receipts</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Lounge & Network Scope:</strong> Notes can be lounge-only or network-shareable</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Auto-Display:</strong> Notes appear automatically when customer checks in</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Context Tags:</strong> Tag notes with behavioral patterns, preferences, or issues</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Shift Continuity:</strong> Notes carry forward between shifts</div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How Staff Notes Work</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'During Session', desc: 'Staff adds notes about customer preferences, behavior, or special requests' },
                { step: '2', title: 'Note Scope', desc: 'Choose if note is lounge-only (private) or network-shareable' },
                { step: '3', title: 'Auto-Save', desc: 'Notes are saved and linked to customer profile automatically' },
                { step: '4', title: 'Next Visit', desc: 'When customer returns, notes appear automatically for staff' },
                { step: '5', title: 'Context Building', desc: 'Each visit adds to the customer memory profile' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">{item.step}</div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                    <li>• Staff notes content</li>
                    <li>• Internal ratings</li>
                    <li>• Behavioral observations</li>
                    <li>• Service context</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-400">
                    <Eye className="w-5 h-5" />
                    Staff-Visible Only
                  </h3>
                  <ul className="space-y-2 text-zinc-300 text-sm">
                    <li>• Appears on staff dashboard</li>
                    <li>• Shows on customer check-in</li>
                    <li>• Available during shift handoff</li>
                    <li>• Never on receipts or guest screens</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <h2 className="text-xl font-bold mb-4">Related Features</h2>
              <p className="text-zinc-300 mb-4">
                Staff Notes work seamlessly with <Link href="/shift-handoff" className="text-teal-400 hover:underline">Shift Handoff</Link> and 
                {' '}<Link href="/customer-memory" className="text-teal-400 hover:underline">Customer Memory</Link> to create a complete customer relationship system.
              </p>
            </Card>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Remember Your Customers?</h2>
              <p className="text-zinc-300 mb-8">See how Staff Notes can help your team provide personalized service.</p>
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

