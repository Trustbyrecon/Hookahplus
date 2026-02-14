'use client';

import React, { useState } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import PageHero from '../../../components/PageHero';
import { QrCode, Download, CheckCircle, Building2, Copy, Mail } from 'lucide-react';
import { WorldShisha2026Tracking } from '../../../lib/campaignTracking';
import { WORLD_SHISHA_2026_CONFIG } from '../../../lib/campaigns/worldShisha2026';

export default function WorldShishaQRGeneratorPage() {
  const [formData, setFormData] = useState({
    exhibitorName: '',
    boothNumber: '',
    referralCode: '',
    email: ''
  });
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateReferralCode = (exhibitorName: string): string => {
    // Generate a simple referral code from exhibitor name
    return exhibitorName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 10)
      .padEnd(10, '0');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.exhibitorName) {
      alert('Please enter your exhibitor/company name.');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate referral code if not provided
      const referralCode = formData.referralCode || generateReferralCode(formData.exhibitorName);
      
      // Build URL with referral code
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net';
      const targetUrl = `${siteUrl}/world-shisha-2026?ref=${referralCode}&exhibitor=${encodeURIComponent(formData.exhibitorName)}${formData.boothNumber ? `&booth=${encodeURIComponent(formData.boothNumber)}` : ''}`;

      // Generate QR code via API
      const response = await fetch('/api/qr-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loungeId: 'WORLD_SHISHA_2026',
          campaignRef: referralCode,
          targetUrl: targetUrl
        }),
      });

      const data = await response.json();

      if (response.ok && data.qrCode) {
        setQrCodeData(data.qrCode.qrCodeData);
        setQrUrl(targetUrl);
        
        // Track QR generation
        WorldShisha2026Tracking.trackQRGenerated({
          exhibitorName: formData.exhibitorName,
          boothNumber: formData.boothNumber || undefined,
          referralCode: referralCode,
          source: 'qr_generator'
        });

        // Update form with generated referral code
        setFormData(prev => ({
          ...prev,
          referralCode: referralCode
        }));
      } else {
        throw new Error(data.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeData) return;

    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `world-shisha-2026-qr-${formData.exhibitorName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    link.click();
  };

  const handleCopyUrl = () => {
    if (!qrUrl) return;
    
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Generate Your Exhibitor QR Code"
        subheadline="Create a branded QR code for your World Shisha 2026 booth that links to Hookah+ and tracks referrals."
        benefit={{
          value: "Track Referrals",
          description: "See how many visitors from your booth engage with Hookah+"
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Exhibitor Information</h2>
              
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Exhibitor/Company Name *
                  </label>
                  <input
                    type="text"
                    name="exhibitorName"
                    value={formData.exhibitorName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Booth Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="boothNumber"
                    value={formData.boothNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    placeholder="Booth #"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Referral Code (Optional - Auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    placeholder="Will be auto-generated"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email (Optional - for tracking)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    placeholder="your@email.com"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating || !formData.exhibitorName}
                  loading={isGenerating}
                  className="w-full"
                  leftIcon={<QrCode className="w-5 h-5" />}
                >
                  {isGenerating ? 'Generating...' : 'Generate QR Code'}
                </Button>
              </form>
            </div>
          </Card>

          {/* QR Code Display Section */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Your QR Code</h2>
              
              {qrCodeData ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 flex items-center justify-center">
                    <img 
                      src={qrCodeData} 
                      alt="QR Code" 
                      className="max-w-full h-auto"
                    />
                  </div>

                  {qrUrl && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Landing Page URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={qrUrl}
                          readOnly
                          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-300"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyUrl}
                          leftIcon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      onClick={handleDownload}
                      className="w-full"
                      leftIcon={<Download className="w-5 h-5" />}
                    >
                      Download QR Code (PNG)
                    </Button>

                    <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-400 mb-2">How to Use</h3>
                      <ul className="text-sm text-zinc-300 space-y-1">
                        <li>• Print this QR code for your booth</li>
                        <li>• Visitors scan to learn about Hookah+</li>
                        <li>• We'll track referrals from your booth</li>
                        <li>• You'll be credited for any signups</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <QrCode className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">
                    Fill out the form to generate your QR code
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8 bg-zinc-900/50 border-zinc-700">
          <div className="p-8">
            <h3 className="text-xl font-semibold mb-4">Why Generate a QR Code?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Building2 className="w-8 h-8 text-teal-400 mb-3" />
                <h4 className="font-semibold mb-2">Add Value to Your Booth</h4>
                <p className="text-sm text-zinc-400">
                  Give lounge owners a reason to stop at your booth beyond just products.
                </p>
              </div>
              <div>
                <QrCode className="w-8 h-8 text-teal-400 mb-3" />
                <h4 className="font-semibold mb-2">Track Referrals</h4>
                <p className="text-sm text-zinc-400">
                  See how many visitors from your booth engage with Hookah+.
                </p>
              </div>
              <div>
                <Mail className="w-8 h-8 text-teal-400 mb-3" />
                <h4 className="font-semibold mb-2">Partnership Opportunities</h4>
                <p className="text-sm text-zinc-400">
                  Become a Featured Smart Lounge Partner and get featured in our materials.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

