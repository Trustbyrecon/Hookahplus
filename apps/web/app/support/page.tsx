'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SupportPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('faq');
  const [trustLockVerified, setTrustLockVerified] = useState(true); // Basic support doesn't need Trust-Lock
  const [supportTicket, setSupportTicket] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  useEffect(() => {
    // Trust-Lock verification only for sensitive operations
    // Basic support access (FAQ, contact forms) doesn't require Trust-Lock
    setTrustLockVerified(true);
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only require Trust-Lock for sensitive operations (payment issues, account problems)
    const requiresTrustLock = supportTicket.subject.toLowerCase().includes('payment') ||
                             supportTicket.subject.toLowerCase().includes('account') ||
                             supportTicket.subject.toLowerCase().includes('refund') ||
                             supportTicket.priority === 'critical';

    if (requiresTrustLock && !trustLockVerified) {
      alert('This type of issue requires Trust-Lock verification. Please contact support directly for sensitive matters.');
      return;
    }

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...supportTicket,
          trustLockVerified: requiresTrustLock ? trustLockVerified : false,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Support ticket submitted successfully! We\'ll get back to you soon.');
        setSupportTicket({
          name: '',
          email: '',
          subject: '',
          message: '',
          priority: 'medium'
        });
      } else {
        alert('Failed to submit support ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const faqItems = [
    {
      question: 'How do I start a new session?',
      answer: 'Simply scan the QR code at your table, select your flavor mix, and complete the payment. Your session will begin automatically!'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, Apple Pay, Google Pay, and PayPal. All payments are processed securely through Stripe.'
    },
    {
      question: 'Can I customize my flavor mix?',
      answer: 'Absolutely! You can create custom flavor combinations, save your favorites, and even share them with friends.'
    },
    {
      question: 'How long does a session last?',
      answer: 'Sessions typically last 1-2 hours, but you can extend them if needed. We\'ll notify you when your session is ending.'
    },
    {
      question: 'What if I have technical issues?',
      answer: 'Our support team is available 24/7. Use the contact form below or click the live chat button for immediate assistance.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer refunds for technical issues or if you\'re not satisfied with your experience. Contact support for assistance.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Support Center</h1>
          <p className="text-gray-300 text-lg mb-6">
            Get help with Hookah+ - we're here to assist you!
          </p>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm">Support Available 24/7</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'faq'
                ? 'bg-purple-600 text-white'
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            📚 FAQ
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'contact'
                ? 'bg-purple-600 text-white'
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            📧 Contact
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white'
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            💬 Live Chat
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'tickets'
                ? 'bg-purple-600 text-white'
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            🎫 My Tickets
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'faq' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-3">{item.question}</h3>
                    <p className="text-gray-300">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Support</h2>
              <form onSubmit={handleSubmitTicket} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={supportTicket.name}
                      onChange={(e) => setSupportTicket({...supportTicket, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={supportTicket.email}
                      onChange={(e) => setSupportTicket({...supportTicket, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={supportTicket.subject}
                    onChange={(e) => setSupportTicket({...supportTicket, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Priority</label>
                  <select
                    value={supportTicket.priority}
                    onChange={(e) => setSupportTicket({...supportTicket, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Message</label>
                  <textarea
                    value={supportTicket.message}
                    onChange={(e) => setSupportTicket({...supportTicket, message: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Please provide details about your issue..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Submit Support Ticket
                </button>
              </form>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Live Chat</h2>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Chat with Support</h3>
                <p className="text-gray-300 mb-6">
                  Our support team is online and ready to help you right now!
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                  Start Live Chat
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">My Support Tickets</h2>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎫</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">No Active Tickets</h3>
                <p className="text-gray-300 mb-6">
                  You don't have any active support tickets. Submit a new ticket above if you need help.
                </p>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Create New Ticket
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Quick Links</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/docs"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              📚 Documentation
            </Link>
            <Link
              href="/api-docs"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              🔌 API Docs
            </Link>
            <Link
              href="/dashboard"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              📊 Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Loading Support Center...</h2>
          <p className="text-gray-300">Please wait while we load the support page.</p>
        </div>
      </div>
    }>
      <SupportPageContent />
    </Suspense>
  );
}
