'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import PageHero from '../../components/PageHero';
import NewsletterSignup from '../../components/NewsletterSignup';
import Button from '../../components/Button';
import { FAQSchema } from '../../components/SchemaMarkup';
import { 
  HelpCircle, 
  Mail, 
  MessageCircle, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Users,
  Zap,
  Calendar,
  Instagram
} from 'lucide-react';

// Analytics tracking functions
const trackConversion = (eventName: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      event_category: 'conversion',
      event_label: eventName,
      value: value || 0,
      currency: 'USD'
    });
    console.log(`[Analytics] 💰 Conversion tracked: ${eventName}`);
  }
};

const trackEngagement = (action: string, component: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'engagement', {
      event_category: 'user_interaction',
      event_label: `${component}:${action}`
    });
    console.log(`[Analytics] 📊 Engagement tracked: ${component}:${action}`);
  }
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'billing' | 'integration';
}

const SupportPage = () => {
  const [activeFAQ, setActiveFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  });

  // Track page view on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Support Center',
        page_location: window.location.href,
        page_path: '/support'
      });
      trackEngagement('page_view', 'support_center');
    }
  }, []);

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I set up my Hookah+ system?',
      answer: 'Setting up Hookah+ is simple! Start by creating your account, then follow our guided setup wizard. You\'ll need to configure your venue details, staff accounts, and session preferences. Our AI agents will help optimize your workflow automatically.',
      category: 'general'
    },
    {
      id: '2',
      question: 'Can I integrate Hookah+ with my existing payment system?',
      answer: 'Yes! Hookah+ connects seamlessly with your existing payment system. Our hospitality-grade ritual intelligence platform abstracts payment complexity while focusing on experience flow and trust capture. Join our waitlist to get early access to integration features.',
      category: 'integration'
    },
    {
      id: '3',
      question: 'How does the Fire Session Dashboard work?',
      answer: 'The Fire Session Dashboard provides real-time monitoring of all active hookah sessions. It tracks session duration, flavor consumption, customer satisfaction, and automatically suggests refills or session extensions based on AI analysis.',
      category: 'technical'
    },
    {
      id: '4',
      question: 'How do I generate QR codes for my lounge tables?',
      answer: 'Navigate to the Admin section in your Hookah+ dashboard, then click on "QR Generator". Enter your lounge ID and optional campaign reference, then click "Generate QR Code". The QR code will link customers directly to your guest portal for seamless session entry.',
      category: 'technical'
    },
    {
      id: '5',
      question: 'What information is included in the QR code?',
      answer: 'QR codes contain your lounge ID and optional campaign tracking parameters. When scanned, customers are directed to the guest portal where they can start their session, view menu items, and place orders. The system tracks the source of each session for analytics.',
      category: 'technical'
    },
    {
      id: '6',
      question: 'What are the pricing options for Hookah+?',
      answer: 'Hookah+ uses subscription tiers (Starter, Pro, Trust+) plus a 0.7% take on hookah GMV when you run payments through Hookah+ (Stripe). The percentage keeps our incentives aligned with yours — we grow when your hookah revenue grows — and covers payment infrastructure without hidden fees. See the Pricing page for tier details and the ROI calculator.',
      category: 'billing'
    },
    {
      id: '7',
      question: 'How do I manage staff permissions and roles?',
      answer: 'Use the Staff Operations panel to assign roles (FOH, BOH, Admin) and set permissions. Our AI system learns from your staff patterns and suggests optimal role assignments based on performance data.',
      category: 'general'
    },
    {
      id: '8',
      question: 'Is my data secure with Hookah+?',
      answer: 'Absolutely! We use enterprise-grade security with Trust-Lock encryption (TLH-v1). All data is encrypted in transit and at rest. We\'re SOC 2 compliant and follow industry best practices for data protection.',
      category: 'technical'
    }
  ];

  const filteredFAQ = faqData.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format message for IG DM
    const message = `Support Request from ${contactForm.name} (${contactForm.email})\n\nCategory: ${contactForm.category}\nPriority: ${contactForm.priority}\nSubject: ${contactForm.subject}\n\nMessage:\n${contactForm.message}`;
    
    // Encode message for Instagram DM
    const encodedMessage = encodeURIComponent(message);
    const instagramUrl = `https://ig.me/m/hookahplusnet?text=${encodedMessage}`;
    
    // Open Instagram DM with pre-filled message
    window.open(instagramUrl, '_blank');
    
    // Also send email as backup
    const emailSubject = encodeURIComponent(`[${contactForm.priority.toUpperCase()}] ${contactForm.subject}`);
    const emailBody = encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\nCategory: ${contactForm.category}\nPriority: ${contactForm.priority}\n\nMessage:\n${contactForm.message}`);
    window.location.href = `mailto:hookahplusconnector@gmail.com?subject=${emailSubject}&body=${emailBody}`;
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'medium',
      category: 'general'
    });
    
    // Show success message
    alert('Opening Instagram DM and email client. Your message has been prepared!');
  };

  const supportChannels = [
    {
      icon: <Instagram className="w-6 h-6" />,
      title: 'Instagram DM',
      description: 'Get instant help via DM',
      status: 'Available',
      responseTime: 'Instant',
      color: 'text-pink-400',
      action: () => window.open('https://ig.me/m/hookahplusnet', '_blank'),
      isButton: true
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'hookahplusconnector@gmail.com',
      status: 'Available',
      responseTime: '< 2 hours',
      color: 'text-blue-400',
      action: () => window.location.href = 'mailto:hookahplusconnector@gmail.com',
      isButton: false
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Coming Soon!',
      status: 'Coming Soon',
      responseTime: 'Soon',
      color: 'text-yellow-400',
      action: null,
      isButton: false
    }
  ];

  const quickActions = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'User Guide',
      description: 'Complete setup and usage guide',
      href: '/docs'
    },
    {
      icon: <Video className="w-5 h-5" />,
      title: 'Video Tutorials',
      description: 'Coming Soon!',
      href: '#'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'API Documentation',
      description: 'Developer resources and APIs',
      href: '/docs/api'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Community Forum',
      description: 'Connect with other Hookah+ users',
      href: '/community'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Request a Demo',
      description: 'Schedule a personalized demo for your lounge',
      href: '/contact'
    }
  ];

  // Prepare FAQ schema data
  const faqSchemaData = faqData.map(item => ({
    question: item.question,
    answer: item.answer
  }));

  return (
    <>
      <FAQSchema faqs={faqSchemaData} />
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Hero Section */}
        <PageHero
        headline="Get answers fast, get back to running your lounge"
        subheadline="AI-powered support + human experts, <2 hour response"
        benefit={{
          value: "24/7 availability, Average resolution: 15 minutes",
          description: "Get help when you need it, resolve issues quickly"
        }}
        trustIndicators={[
          { icon: <Clock className="w-4 h-4 text-teal-400" />, text: "<2 hour response" },
          { icon: <CheckCircle className="w-4 h-4 text-teal-400" />, text: "24/7 availability" },
          { icon: <Zap className="w-4 h-4 text-teal-400" />, text: "AI + human experts" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Support Channels */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Get Help Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportChannels.map((channel, index) => (
              <div key={index} className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6 hover:border-zinc-600 transition-colors">
                <div className="flex items-center mb-4">
                  <div className={`mr-3 ${channel.color}`}>
                    {channel.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{channel.title}</h3>
                    <p className="text-sm text-zinc-400">{channel.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-medium ${channel.color}`}>
                    {channel.status}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {channel.responseTime}
                  </span>
                </div>
                {channel.isButton && channel.action && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={channel.action}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Open Instagram DM
                  </Button>
                )}
                {!channel.isButton && channel.action && (
                  <button
                    onClick={channel.action}
                    className="w-full text-sm text-zinc-400 hover:text-teal-400 transition-colors text-left"
                  >
                    {channel.description}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - AI-Friendly Structured Content */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors group"
                itemScope
                itemType="https://schema.org/WebPage"
              >
                <div className="flex items-center mb-3">
                  <div className="text-primary-400 mr-3 group-hover:text-primary-300 transition-colors" itemProp="image">
                    {action.icon}
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400 ml-auto" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1" itemProp="name">{action.title}</h3>
                <p className="text-xs text-zinc-400" itemProp="description">{action.description}</p>
                <link itemProp="url" href={action.href} />
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <div className="relative">
              <Search className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-400 focus:border-primary-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredFAQ.map((item) => (
              <div key={item.id} className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg">
                <button
                  onClick={() => setActiveFAQ(activeFAQ === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mr-4" />
                    <span className="text-white font-medium">{item.question}</span>
                  </div>
                  {activeFAQ === item.id ? (
                    <ChevronUp className="w-5 h-5 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  )}
                </button>
                {activeFAQ === item.id && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-zinc-700 pt-4">
                      <p className="text-zinc-300 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Contact Our Team</h2>
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-8">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:border-primary-400 focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:border-primary-400 focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Category
                  </label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:border-primary-400 focus:outline-none"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="integration">Integration Help</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:border-primary-400 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:border-primary-400 focus:outline-none"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:border-primary-400 focus:outline-none resize-none"
                  placeholder="Please provide detailed information about your question or issue..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-zinc-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>We typically respond within 2 hours</span>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Send via Instagram DM
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-white">All Systems Operational</div>
                <div className="text-xs text-zinc-400">99.9% uptime</div>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-white">AI Agents Active</div>
                <div className="text-xs text-zinc-400">Flow Constant Λ∞</div>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-white">Trust-Lock Secure</div>
                <div className="text-xs text-zinc-400">TLH-v1::active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mb-8">
          <NewsletterSignup
            variant="inline"
            title="Get Weekly Tips & Updates"
            description="Stay updated with the latest Hookah+ features, best practices, and industry insights delivered to your inbox."
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default SupportPage;
