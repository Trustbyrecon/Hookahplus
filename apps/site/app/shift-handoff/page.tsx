'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Users, 
  CheckCircle, 
  Calendar,
  Clock,
  FileText,
  ArrowRight
} from 'lucide-react';

export default function ShiftHandoffPage() {
  const description = "Hookah+ Shift Handoff ensures seamless continuity between shifts. Every shift starts with full context—active sessions, customer profiles, staff notes, and operational status.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/shift-handoff`
    : "https://hookahplus.net/shift-handoff";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Shift Handoff"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Shift Handoff</h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">{description}</p>

            <Card className="p-6 bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border-teal-500/30 mb-8">
              <p className="text-2xl font-semibold text-center">"Every shift starts with full context."</p>
            </Card>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">What Gets Handed Off</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Active Sessions:</strong> All ongoing sessions with timing, table assignments, and customer info</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Customer Profiles:</strong> Recent customer check-ins and their preferences</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Staff Notes:</strong> All notes from previous shift for context</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Table Status:</strong> Current table occupancy and availability</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Operational Context:</strong> Any issues, special requests, or ongoing situations</div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How Shift Handoff Works</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'End of Shift', desc: 'Outgoing staff reviews active sessions and adds any final notes' },
                { step: '2', title: 'Handoff Summary', desc: 'System generates summary of all active sessions and context' },
                { step: '3', title: 'Shift Start', desc: 'Incoming staff sees complete context immediately upon login' },
                { step: '4', title: 'Seamless Continuity', desc: 'No information loss—every detail carries forward' },
                { step: '5', title: 'Customer Experience', desc: 'Customers never notice shift change—service continues smoothly' }
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
            <h2 className="text-2xl font-bold mb-6">Benefits</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Clock className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">No Context Loss</h3>
                <p className="text-zinc-400 text-sm">All information carries forward between shifts</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Users className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Better Service</h3>
                <p className="text-zinc-400 text-sm">New shift starts with full customer context</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <FileText className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Reduced Stress</h3>
                <p className="text-zinc-400 text-sm">Staff doesn't need to ask "what's happening?"</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready for Seamless Shifts?</h2>
              <p className="text-zinc-300 mb-8">See how Shift Handoff can eliminate context loss between shifts.</p>
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

