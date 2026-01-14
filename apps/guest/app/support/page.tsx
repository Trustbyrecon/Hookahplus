'use client';

import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  Shield,
  CreditCard,
  Zap,
  Instagram
} from 'lucide-react';

export default function SupportPage() {
  const supportOptions = [
    {
      icon: Instagram,
      title: 'Instagram DM',
      description: 'Message us on Instagram for quick help',
      status: 'Available',
      action: 'Open Instagram',
      link: 'https://instagram.com/m/hookahplusnet',
      external: true
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      status: '24/7 Available',
      action: 'Call Now'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      status: 'Response within 2 hours',
      action: 'Send Email'
    }
  ];

  const faqItems = [
    {
      question: 'How do I start a Fire Session?',
      answer: 'Add items to your cart and click the "Fire Session" button. Your session will begin once payment is confirmed.'
    },
    {
      question: 'Can I modify my order after starting?',
      answer: 'Yes, you can add or remove items from your cart before confirming payment. Once the session starts, modifications require staff assistance.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, Apple Pay, Google Pay, and contactless payments through our secure Stripe integration.'
    },
    {
      question: 'How does the Trust-Lock system work?',
      answer: 'Trust-Lock tracks your session history and builds a trust score. Higher scores unlock premium features and faster service.'
    },
    {
      question: 'Can I extend my session?',
      answer: 'Yes, you can extend your session in 20-minute increments. Use the "Control Panel" option in the navigation.'
    },
    {
      question: 'What are the session stages?',
      answer: 'Your session goes through 5 stages: Payment (payment confirmed), Prep (being prepared), Ready (ready for delivery), Deliver (out for delivery), and Light (session active). You can track your session progress in real-time.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Support Center</h1>
          <p className="text-zinc-400">Get help with your Hookah+ experience</p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card key={index} className="p-6 text-center">
                <Icon className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                <p className="text-zinc-400 text-sm mb-4">{option.description}</p>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-sm text-green-400">{option.status}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (option.link) {
                      window.open(option.link, option.external ? '_blank' : '_self');
                    }
                  }}
                >
                  {option.action}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-zinc-700 pb-4 last:border-b-0">
                  <h3 className="font-medium mb-2">{item.question}</h3>
                  <p className="text-zinc-400 text-sm">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={() => window.location.href = '/control-panel'}
              >
                <Clock className="w-4 h-4" />
                <span>Control Panel</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={() => window.location.href = '/'}
              >
                <Zap className="w-4 h-4" />
                <span>Start New Session</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={() => window.location.href = '/docs'}
              >
                <HelpCircle className="w-4 h-4" />
                <span>View Documentation</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
