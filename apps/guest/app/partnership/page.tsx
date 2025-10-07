'use client';

import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Users, 
  Star, 
  TrendingUp, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function ConnectorPartnershipPage() {
  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6 text-green-400" />,
      title: 'Revenue Growth',
      description: 'Increase your lounge revenue by 25-40% with our proven hookah session management system'
    },
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      title: 'Customer Retention',
      description: 'Build lasting customer relationships with our Trust Lock identity system'
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      title: 'Secure Payments',
      description: 'PCI-compliant payment processing with Stripe integration'
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-400" />,
      title: 'Real-time Management',
      description: 'Live session monitoring and staff coordination tools'
    }
  ];

  const features = [
    'Cross-venue customer identity tracking',
    'Automated session timing and billing',
    'Staff workflow optimization',
    'Customer loyalty and badge system',
    'Real-time analytics dashboard',
    'Mobile-responsive design',
    '24/7 technical support',
    'Easy integration with existing POS'
  ];

  const tiers = [
    {
      name: 'Starter',
      price: '$99/month',
      description: 'Perfect for small lounges',
      features: [
        'Up to 5 tables',
        'Basic session management',
        'Standard support',
        'Mobile app access'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$199/month',
      description: 'Most popular for growing lounges',
      features: [
        'Up to 20 tables',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large lounge chains',
      features: [
        'Unlimited tables',
        'White-label solution',
        'Dedicated support',
        'Custom integrations',
        'On-site training'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                🏢 Connector Partnership Program
              </h1>
              <p className="text-zinc-400 mt-1">Join the future of hookah lounge management</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                ← Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Transform Your Hookah Lounge
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
            Join hundreds of successful hookah lounges using Hookah+ to increase revenue, 
            improve customer experience, and streamline operations.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              variant="fire" 
              size="lg"
              onClick={() => {
                // Scroll to contact section
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get Started Today
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                // Open demo
                window.open('https://hookahplus-app-prod.vercel.app/fire-session-dashboard', '_blank');
              }}
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-zinc-400 text-sm">{benefit.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">What You Get</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-zinc-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Choose Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'ring-2 ring-teal-500' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <h4 className="text-xl font-bold mb-2">{tier.name}</h4>
                  <p className="text-zinc-400 mb-4">{tier.description}</p>
                  <div className="text-3xl font-bold mb-6">{tier.price}</div>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={tier.popular ? "fire" : "outline"} 
                    className="w-full"
                    onClick={() => {
                      // Contact for this tier
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="mb-12">
          <Card>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-center mb-8">Ready to Get Started?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-teal-400" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-teal-400" />
                      <span>partnerships@hookahplus.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-teal-400" />
                      <span>San Francisco, CA</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Quick Start</h4>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        window.open('https://hookahplus-app-prod.vercel.app/fire-session-dashboard', '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Live Demo
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        window.open('mailto:partnerships@hookahplus.com?subject=Partnership Inquiry', '_blank');
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        window.open('tel:+15551234567', '_blank');
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-zinc-400">
          <p>© 2024 Hookah+ Connector Partnership Program. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
