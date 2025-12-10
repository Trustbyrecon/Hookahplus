'use client';

import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  FileText, 
  Download, 
  ExternalLink,
  Zap,
  Shield,
  CreditCard,
  Clock,
  Users
} from 'lucide-react';

export default function DocsPage() {
  const documentationSections = [
    {
      icon: Zap,
      title: 'Getting Started',
      description: 'Learn how to use the Hookah+ guest portal',
      items: [
        'How to start a Fire Session',
        'Understanding the Trust-Lock system',
        'Payment and billing guide',
        'Session management basics'
      ]
    },
    {
      icon: Shield,
      title: 'Security & Trust',
      description: 'Understanding our security measures',
      items: [
        'Trust-Lock authentication',
        'Payment security',
        'Data privacy policy',
        'Session encryption'
      ]
    },
    {
      icon: CreditCard,
      title: 'Payment Guide',
      description: 'Everything about payments and billing',
      items: [
        'Accepted payment methods',
        'Understanding charges',
        'Refund policy',
        'Session extensions'
      ]
    },
    {
      icon: Clock,
      title: 'Session Management',
      description: 'Managing your hookah sessions',
      items: [
        'Starting and ending sessions',
        'Session timers and extensions',
        'Troubleshooting common issues',
        'Staff assistance requests'
      ]
    }
  ];

  const apiDocs = [
    {
      title: 'Guest API Reference',
      description: 'Complete API documentation for guest portal integration',
      version: 'v1.2.0',
      lastUpdated: '2024-01-15'
    },
    {
      title: 'Webhook Integration',
      description: 'Real-time event notifications and webhook setup',
      version: 'v1.1.0',
      lastUpdated: '2024-01-10'
    },
    {
      title: 'Trust-Lock API',
      description: 'Authentication and trust scoring API endpoints',
      version: 'v1.0.0',
      lastUpdated: '2024-01-05'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Documentation</h1>
          <p className="text-zinc-400">Complete guides and API references for Hookah+</p>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {documentationSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <Icon className="w-8 h-8 text-primary-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                    <p className="text-zinc-400 text-sm mb-4">{section.description}</p>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                          <span className="text-zinc-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" className="mt-4">
                      Read Guide
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* API Documentation */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">API Documentation</h2>
            <div className="space-y-4">
              {apiDocs.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{doc.title}</h3>
                    <p className="text-zinc-400 text-sm mb-2">{doc.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-zinc-500">
                      <span>Version: {doc.version}</span>
                      <span>Updated: {doc.lastUpdated}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Online
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={() => window.location.href = '/support'}
              >
                <Users className="w-4 h-4" />
                <span>Contact Support</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={() => window.location.href = '/'}
              >
                <Zap className="w-4 h-4" />
                <span>Start Session</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={() => window.open('https://hookahplus-app-prod.vercel.app/fire-session-dashboard', '_blank')}
              >
                <Shield className="w-4 h-4" />
                <span>Staff Dashboard</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
