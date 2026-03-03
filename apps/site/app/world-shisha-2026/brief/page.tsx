'use client';

import React, { useState, useEffect } from 'react';
import PageHero from '../../../components/PageHero';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import { Download, CheckCircle, TrendingUp, BarChart3, Users, Clock, Zap, Building2, QrCode, ArrowRight } from 'lucide-react';
import { trackLeadMagnetDownloadConversion } from '../../../lib/conversionTracking';
import { trackConversion } from '../../../lib/conversionTracking';

export default function WorldShishaBriefPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [exhibitor, setExhibitor] = useState('');

  // Track page view
  useEffect(() => {
    trackConversion({
      eventName: 'world_shisha_2026_brief_view',
      eventCategory: 'campaign',
      eventLabel: 'intelligence_brief',
      metadata: { campaign: 'world_shisha_2026' }
    });
  }, []);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      // Track conversion
      trackLeadMagnetDownloadConversion('smart-lounge-playbook-2026', {
        email,
        name: name || undefined,
        campaign: 'world_shisha_2026',
        exhibitor: exhibitor || undefined
      });

      // Call download API
      const response = await fetch('/api/world-shisha-2026/brief/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          exhibitor: exhibitor || undefined,
          campaign: 'world_shisha_2026'
        }),
      });

      if (response.ok) {
        // Trigger download
        const link = document.createElement('a');
        link.href = '/lead-magnets/smart-lounge-playbook-2026.pdf';
        link.download = 'smart-lounge-playbook-2026.pdf';
        link.click();

        setIsDownloaded(true);

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/thank-you/pilot-pack?source=brief&campaign=world_shisha_2026';
        }, 2000);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading brief:', error);
      alert('Failed to download. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="The Smart Lounge Playbook 2026"
        subheadline="How to Turn Every Hookah Session Into a Revenue Loop"
        benefit={{
          value: "Operations + Analytics Leader",
          description: "While everyone else shows flavors and pipes, we're the data brain for lounges"
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Download Form */}
        {!isDownloaded ? (
          <Card className="mb-12 bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <div className="text-center mb-8">
                <Download className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">
                  Download Your Free Playbook
                </h2>
                <p className="text-zinc-300 mb-6">
                  Get instant access to the complete Smart Lounge Playbook 2026. Learn how top lounges increase revenue by 22% and reduce order time by 35%.
                </p>
              </div>

              <form onSubmit={handleDownload} className="max-w-md mx-auto">
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Exhibitor/Company (Optional)
                    </label>
                    <input
                      type="text"
                      value={exhibitor}
                      onChange={(e) => setExhibitor(e.target.value)}
                      placeholder="Company or exhibitor name"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !email}
                  loading={isSubmitting}
                  className="w-full"
                  leftIcon={<Download className="w-5 h-5" />}
                >
                  {isSubmitting ? 'Preparing Download...' : 'Download Playbook'}
                </Button>
              </form>
            </div>
          </Card>
        ) : (
          <Card className="mb-12 bg-green-500/10 border-green-500/30">
            <div className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Download Started!</h3>
              <p className="text-zinc-300">Your Smart Lounge Playbook 2026 is downloading.</p>
            </div>
          </Card>
        )}

        {/* Brief Preview Content */}
        <div className="space-y-8">
          {/* Page 1: Cover & Introduction */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6">The Smart Lounge Playbook 2026</h2>
              <p className="text-xl text-zinc-300 mb-6">
                How to Turn Every Hookah Session Into a Revenue Loop
              </p>
              <p className="text-zinc-400 leading-relaxed">
                While exhibitors at World Shisha 2026 showcase flavors, charcoal, and hardware, 
                Hookah+ is the operations + analytics brain that helps lounges make more money. 
                This playbook shows you exactly how top-performing lounges use data-driven operations 
                to increase revenue, reduce costs, and delight customers.
              </p>
            </div>
          </Card>

          {/* Page 2: Session Time vs. Revenue */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-8 h-8 text-teal-400" />
                <h2 className="text-3xl font-bold">Session Time vs. Revenue</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                  <h3 className="text-xl font-semibold mb-4 text-red-400">Before Hookah+</h3>
                  <ul className="space-y-2 text-zinc-300">
                    <li>• Manual session tracking</li>
                    <li>• 3.2 average table turns per day</li>
                    <li>• 12-minute average order time</li>
                    <li>• Limited upsell opportunities</li>
                  </ul>
                </div>
                
                <div className="bg-zinc-800/50 rounded-lg p-6 border border-teal-500/30">
                  <h3 className="text-xl font-semibold mb-4 text-teal-400">After Hookah+</h3>
                  <ul className="space-y-2 text-zinc-300">
                    <li>• Automated session tracking</li>
                    <li>• 3.9 average table turns per day (+22%)</li>
                    <li>• 7.8-minute average order time (-35%)</li>
                    <li>• 30% session extension rate</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-lg p-6 border border-teal-500/30">
                <h3 className="text-lg font-semibold mb-3">Revenue Impact</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-teal-400">↑ 22%</div>
                    <div className="text-sm text-zinc-400">Table Turns</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-400">↑ 30%</div>
                    <div className="text-sm text-zinc-400">Session Extensions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-400">↑ 18%</div>
                    <div className="text-sm text-zinc-400">Upsell Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Page 3: Popular Mix Patterns */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-8 h-8 text-teal-400" />
                <h2 className="text-3xl font-bold">Popular Mix Patterns</h2>
              </div>
              
              <p className="text-zinc-300 mb-6">
                Data from 10,000+ sessions shows which flavor combinations drive the most revenue 
                and customer satisfaction.
              </p>

              <div className="space-y-4">
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Blue Mist + Mint</span>
                    <span className="text-teal-400 font-bold">32%</span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div className="bg-teal-400 h-2 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                  <p className="text-sm text-zinc-400 mt-2">Highest revenue per session</p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Strawberry + Mango</span>
                    <span className="text-teal-400 font-bold">28%</span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div className="bg-teal-400 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                  <p className="text-sm text-zinc-400 mt-2">Most popular combination</p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Double Apple + Rose</span>
                    <span className="text-teal-400 font-bold">24%</span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div className="bg-teal-400 h-2 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                  <p className="text-sm text-zinc-400 mt-2">Premium tier favorite</p>
                </div>
              </div>

              <div className="mt-6 bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <p className="text-sm text-zinc-300">
                  <strong className="text-teal-400">Insight:</strong> Premium flavor combinations 
                  (3+ flavors) generate 40% more revenue per session than single-flavor orders.
                </p>
              </div>
            </div>
          </Card>

          {/* Page 4: Staff Efficiency & Table Turn Time */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-teal-400" />
                <h2 className="text-3xl font-bold">Staff Efficiency & Table Turn Time</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 text-center">
                  <Clock className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">↓ 35%</div>
                  <p className="text-zinc-400">Order Time Reduction</p>
                  <p className="text-sm text-zinc-500 mt-2">12 min → 7.8 min</p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 text-center">
                  <TrendingUp className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">↑ 22%</div>
                  <p className="text-zinc-400">Table Turn Increase</p>
                  <p className="text-sm text-zinc-500 mt-2">3.2 → 3.9 per day</p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 text-center">
                  <Users className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">15+</div>
                  <p className="text-zinc-400">Orders per Staff/Shift</p>
                  <p className="text-sm text-zinc-500 mt-2">Industry leading</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-lg p-6 border border-teal-500/30">
                <h3 className="text-lg font-semibold mb-3">How It Works</h3>
                <ul className="space-y-2 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>QR-based ordering eliminates wait staff bottlenecks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Automated session tracking reduces manual coordination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Real-time alerts optimize Back of the House and Front of the House workflow</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Page 5: Loyalty & Repeat-Visit Patterns */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-8 h-8 text-teal-400" />
                <h2 className="text-3xl font-bold">Loyalty & Repeat-Visit Patterns</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                  <h3 className="text-xl font-semibold mb-4">Retention Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-zinc-300">Monthly Retention</span>
                        <span className="text-teal-400 font-bold">60%+</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-teal-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-zinc-300">Return Customer Rate</span>
                        <span className="text-teal-400 font-bold">45%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-teal-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                  <h3 className="text-xl font-semibold mb-4">Loyalty Tiers</h3>
                  <div className="space-y-2 text-zinc-300">
                    <div className="flex justify-between">
                      <span>Bronze (5+ visits)</span>
                      <span className="text-teal-400">10% discount</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Silver (15+ visits)</span>
                      <span className="text-teal-400">15% discount</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gold (30+ visits)</span>
                      <span className="text-teal-400">20% discount</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platinum (50+ visits)</span>
                      <span className="text-teal-400">25% discount</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-lg p-6 border border-teal-500/30">
                <p className="text-zinc-300">
                  <strong className="text-teal-400">Customer Lifetime Value:</strong> Loyalty program 
                  members have 3x higher lifetime value than one-time visitors, with an average of 
                  $450+ per customer over 12 months.
                </p>
              </div>
            </div>
          </Card>

          {/* Page 6: POS Integration & QR Companion Flow */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <QrCode className="w-8 h-8 text-teal-400" />
                <h2 className="text-3xl font-bold">POS Integration & QR Companion Flow</h2>
              </div>

              <p className="text-zinc-300 mb-6">
                Hookah+ works seamlessly with your existing POS system (Square, Clover, Toast) 
                as a companion layer that adds intelligence without replacing your current setup.
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-400" />
                    POS Integration
                  </h3>
                  <p className="text-zinc-300 text-sm">
                    Sync session data with Square, Clover, or Toast. Hookah+ handles QR ordering, 
                    session tracking, and analytics while your POS handles payments.
                  </p>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-teal-400" />
                    QR-Based Ordering Workflow
                  </h3>
                  <p className="text-zinc-300 text-sm">
                    Customer scans QR → Selects flavors/add-ons → Order sent to Back of the House → 
                    Session tracked automatically → Payment processed via your POS → 
                    Analytics captured in real-time.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-lg p-6 border border-teal-500/30 text-center">
                <h3 className="text-xl font-semibold mb-4">Ready to Transform Your Lounge?</h3>
                <p className="text-zinc-300 mb-6">
                  World Shisha 2026 attendees: Book a free Smart Lounge Simulation for your venue.
                </p>
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/world-shisha-2026/pilot-pack'}
                  leftIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Your Pilot Pack
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

