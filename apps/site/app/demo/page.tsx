'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  PlayCircle, 
  CheckCircle, 
  Calendar,
  Video,
  ArrowRight
} from 'lucide-react';

export default function DemoPage() {
  const description = "See Hookah+ in action. Book a 15-minute demo to see how session timing, customer memory, and shift handoff work together to transform your hookah lounge operations.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/demo`
    : "https://hookahplus.net/demo";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Demo"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">See Hookah+ in Action</h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">{description}</p>

            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30 mb-8">
              <h2 className="text-2xl font-bold mb-4">What You'll See</h2>
              <ul className="space-y-3 text-zinc-300 text-left max-w-2xl mx-auto">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>Session timing and table management in real-time</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>Customer memory and C.L.A.R.K. system in action</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>Shift handoff and staff notes workflow</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>POS integration (Square, Toast, Clover)</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>Analytics and reporting dashboards</div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Book Your Demo</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Video className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Live Demo</h3>
                <p className="text-zinc-400 text-sm mb-4">15-minute walkthrough of Hookah+ features</p>
                <Button
                  variant="primary"
                  onClick={() => window.open('https://ig.me/m/hookahplusnet', '_blank')}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Live Demo
                </Button>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <PlayCircle className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Self-Service Demo</h3>
                <p className="text-zinc-400 text-sm mb-4">Try Hookah+ yourself with demo mode</p>
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/fire-session-dashboard?mode=demo'}
                  className="w-full"
                >
                  Start Demo Mode
                </Button>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <h2 className="text-xl font-bold mb-4">Demo Details</h2>
              <ul className="space-y-2 text-zinc-300">
                <li>• <strong className="text-white">Duration:</strong> 15 minutes</li>
                <li>• <strong className="text-white">Format:</strong> Live screen share or in-person</li>
                <li>• <strong className="text-white">Focus:</strong> Your specific use case and questions</li>
                <li>• <strong className="text-white">No commitment:</strong> Just see how it works</li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to See Hookah+?</h2>
              <p className="text-zinc-300 mb-8">Book a demo and see how Hookah+ can transform your operations.</p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.open('https://ig.me/m/hookahplusnet', '_blank')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book 15 min demo
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}

