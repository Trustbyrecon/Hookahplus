'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import PageHero from '../../components/PageHero';
import CalendlyEmbed from '../../components/CalendlyEmbed';
import { 
  Play, Calendar, Download, QrCode, CheckCircle, TrendingUp, 
  BarChart3, Users, Clock, ArrowRight, Mail, Globe, Clock as ClockIcon,
  Building2, Zap, Shield
} from 'lucide-react';
import { trackConversion } from '../../lib/conversionTracking';
import { trackCTA } from '../../lib/ctaTracking';

export default function WorldShisha2026Page() {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Track page view on mount
  useEffect(() => {
    trackConversion({
      eventName: 'world_shisha_2026_landing_view',
      eventCategory: 'campaign',
      eventLabel: 'world_shisha_2026',
      metadata: {
        campaign: 'world_shisha_2026',
        timestamp: new Date().toISOString()
      }
    });
  }, []);

  const handleVideoPlay = () => {
    if (!videoPlaying) {
      setVideoPlaying(true);
      trackConversion({
        eventName: 'world_shisha_2026_video_play',
        eventCategory: 'engagement',
        eventLabel: 'product_video',
        metadata: { campaign: 'world_shisha_2026' }
      });
    }
  };

  const handleVideoLinkClick = () => {
    trackConversion({
      eventName: 'world_shisha_2026_video_complete',
      eventCategory: 'engagement',
      eventLabel: 'video_link_click',
      metadata: { campaign: 'world_shisha_2026' }
    });
    window.open('https://youtube.com/shorts/LjbGwWOI_Nk', '_blank', 'noopener,noreferrer');
  };

  const handleCalendarClick = () => {
    setShowCalendar(true);
    trackConversion({
      eventName: 'world_shisha_2026_calendar_click',
      eventCategory: 'engagement',
      eventLabel: 'calendar_booking',
      metadata: { campaign: 'world_shisha_2026' }
    });
  };

  const handleBriefDownload = () => {
    window.location.href = '/world-shisha-2026/brief';
    trackConversion({
      eventName: 'world_shisha_2026_brief_download',
      eventCategory: 'conversion',
      eventLabel: 'intelligence_brief',
      metadata: { campaign: 'world_shisha_2026' }
    });
  };

  const handlePilotPackClick = () => {
    window.location.href = '/world-shisha-2026/pilot-pack';
    trackCTA({
      ctaSource: 'website',
      ctaType: 'demo_request',
      component: 'WorldShisha2026PilotPack',
      campaignId: 'world_shisha_2026',
      metadata: { action: 'pilot_pack_click' }
    });
  };

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/world-shisha-2026/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          campaign: 'world_shisha_2026',
          source: 'landing_page'
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail('');
        trackConversion({
          eventName: 'world_shisha_2026_lead_capture',
          eventCategory: 'conversion',
          eventLabel: 'email_signup',
          metadata: { campaign: 'world_shisha_2026' }
        });
      }
    } catch (error) {
      console.error('Error capturing lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get Dubai time
  const getDubaiTime = () => {
    const dubaiTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dubai',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return dubaiTime;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <PageHero
        headline="Live from Dubai: The Smart Lounge Revolution"
        subheadline="While everyone else shows flavors and pipes, we're the operations + analytics brain for lounges. See how Hookah+ turns every session into a revenue loop."
        benefit={{
          value: "↑ 22% table turns, ↓ 35% order time",
          description: "AI-powered operations that reduce management friction by 40%"
        }}
        primaryCTA={{
          text: "Download Smart Lounge Playbook 2026",
          onClick: handleBriefDownload
        }}
        secondaryCTA={{
          text: "Book Private Walkthrough",
          onClick: handleCalendarClick
        }}
        trustIndicators={[
          { icon: <Globe className="w-4 h-4 text-teal-400" />, text: "Live from Dubai World Trade Centre" },
          { icon: <ClockIcon className="w-4 h-4 text-teal-400" />, text: `Dubai Time: ${getDubaiTime()}` },
          { icon: <Shield className="w-4 h-4 text-teal-400" />, text: "60-day pilot available" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Product Video Section */}
        <Card className="mb-12 bg-zinc-900/50 border-zinc-700">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Play className="w-6 h-6 text-teal-400" />
              <h2 className="text-3xl font-bold">See Hookah+ in Action</h2>
            </div>
            <p className="text-zinc-400 mb-6 max-w-2xl">
              Watch a 60-90 second walkthrough of our Operator Dashboard and session flow. See how real lounges use Hookah+ to increase revenue and delight customers.
            </p>
            
            {/* Product Demo Video - YouTube Embed */}
            <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/LjbGwWOI_Nk"
                title="Hookah+ Product Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => {
                  if (!videoPlaying) {
                    handleVideoPlay();
                  }
                }}
              />
            </div>
          </div>
        </Card>

        {/* Calendar Booking Section */}
        {showCalendar && (
          <Card className="mb-12 bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-teal-400" />
                  <h2 className="text-3xl font-bold">Book Your Private Walkthrough</h2>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowCalendar(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  Close
                </Button>
              </div>
              <p className="text-zinc-400 mb-6">
                Not enough time to talk on the floor? Book a private Smart Lounge walkthrough during World Shisha 2026 show hours (Dubai time).
              </p>
              <CalendlyEmbed url="https://calendly.com/clark-dwayne/new-meeting?embed_domain=hookahplus.net&embed_type=Inline" />
            </div>
          </Card>
        )}

        {/* Pilot Pack Offer Section */}
        <Card className="mb-12 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-teal-400" />
              <h2 className="text-3xl font-bold">World Shisha 2026 Pilot Pack</h2>
            </div>
            <p className="text-zinc-300 mb-6 text-lg">
              Exclusive offer for World Shisha 2026 attendees: Get a 60-day pilot to experience Hookah+ in your lounge.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <h3 className="text-xl font-semibold mb-4">What's Included:</h3>
                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>1 lounge location setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Session tracking + flavor analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Basic loyalty tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>QR code setup & integration</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <h3 className="text-xl font-semibold mb-4">Perfect For:</h3>
                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Lounge owners exploring operations tech</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Distributors evaluating partner solutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Exhibitors looking to add value to their booths</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handlePilotPackClick}
              className="w-full md:w-auto"
            >
              Get Your Pilot Pack
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Social Proof Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-zinc-900/50 border-zinc-700 text-center p-6">
            <TrendingUp className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">↑ 22%</div>
            <p className="text-zinc-400">Table Turn Increase</p>
          </Card>
          
          <Card className="bg-zinc-900/50 border-zinc-700 text-center p-6">
            <Clock className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">↓ 35%</div>
            <p className="text-zinc-400">Order Time Reduction</p>
          </Card>
          
          <Card className="bg-zinc-900/50 border-zinc-700 text-center p-6">
            <Users className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">60%+</div>
            <p className="text-zinc-400">Monthly Retention Rate</p>
          </Card>
        </div>

        {/* Lead Capture Section */}
        <Card className="bg-zinc-900/50 border-zinc-700">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Connected</h2>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Get updates on Smart Lounge operations, exclusive World Shisha 2026 content, and early access to new features.
            </p>
            
            {submitted ? (
              <div className="py-4">
                <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                <p className="text-zinc-300">Thank you! We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleLeadCapture} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    loading={isSubmitting}
                    leftIcon={<Mail className="w-5 h-5" />}
                    className="whitespace-nowrap"
                  >
                    {isSubmitting ? 'Submitting...' : 'Subscribe'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>

        {/* QR Code Generator CTA */}
        <Card className="mt-12 bg-zinc-900/50 border-zinc-700">
          <div className="p-8 text-center">
            <QrCode className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Exhibitor Partners</h2>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Are you an exhibitor? Generate a branded QR code for your booth that links to Hookah+ and tracks referrals.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/world-shisha-2026/qr-generator'}
            >
              Generate QR Code
              <QrCode className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

