'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  QrCode, 
  CheckCircle, 
  ArrowRight,
  Smartphone,
  CreditCard,
  Clock,
  Calendar
} from 'lucide-react';

export default function QRPreorderBillPayPage() {
  const description = "Hookah+ QR Preorder + Bill Pay lets guests scan a QR code at their table to browse flavors, pre-order add-ons, extend sessions, and pay their bill. It reduces wait time, increases upsells, and frees staff to focus on service.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/qr-preorder-billpay`
    : "https://hookahplus.net/qr-preorder-billpay";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Hookah+ QR Preorder + Bill Pay"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Citation Magnet Block */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hookah+ QR Preorder + Bill Pay
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
                    <strong className="text-white">Guest-facing:</strong> mobile web app (no app download required)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Features:</strong> flavor browsing, pre-order, session extension, bill pay, loyalty check-in
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Payment:</strong> Stripe integration for secure card payments; syncs to your POS
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Privacy:</strong> guest data stored securely; payment info never stored by Hookah+
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
                  <h3 className="font-semibold mb-1">Guest scans QR code</h3>
                  <p className="text-zinc-400">QR code on table links to their session; opens mobile web app</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Browse and pre-order</h3>
                  <p className="text-zinc-400">View available flavors, add premium options, extend session time</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Staff notified</h3>
                  <p className="text-zinc-400">Real-time notifications alert staff to new orders and requests</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Pay bill when ready</h3>
                  <p className="text-zinc-400">Guest pays securely via Stripe; receipt syncs to your POS</p>
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
                <Smartphone className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">No App Download</h3>
                <p className="text-zinc-400 text-sm">Works in any mobile browser — guests don't need to install anything</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Clock className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Session-Aware</h3>
                <p className="text-zinc-400 text-sm">Automatically linked to active session timer; shows real-time duration</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <CreditCard className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-zinc-400 text-sm">PCI-compliant Stripe integration; payment data never stored</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Benefits</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <ul className="space-y-2 text-zinc-300">
                <li>• <strong className="text-white">Reduces wait time:</strong> Guests order without flagging down staff</li>
                <li>• <strong className="text-white">Increases upsells:</strong> Guests browse full menu at their pace</li>
                <li>• <strong className="text-white">Frees staff:</strong> Less time taking orders, more time on service</li>
                <li>• <strong className="text-white">Faster checkout:</strong> Guests pay when ready, no waiting for bill</li>
                <li>• <strong className="text-white">Contactless:</strong> Reduces physical contact points</li>
                <li>• <strong className="text-white">Loyalty integration:</strong> Automatic points and rewards tracking</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Setup Time */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Setup Time</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <p className="text-zinc-300">
                Included in all Hookah+ plans. QR codes are generated automatically per table/section. 
                <strong className="text-white"> No additional setup required</strong> — works out of the box with Session Timer POS.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Reduce Wait Times?</h2>
              <p className="text-zinc-300 mb-8">
                See how QR Preorder + Bill Pay can improve guest experience and staff efficiency.
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

