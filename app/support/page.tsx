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
        alert('Support ticket submitted successfully! We\'ll respond within 2 hours.');
        setSupportTicket({ name: '', email: '', subject: '', message: '', priority: 'medium' });
      }
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    }
  };

  const faqItems = [
    {
      question: "How do I start a hookah session?",
      answer: "Scan the QR code at your table, select your flavor mix, and complete the payment. Your session will be prepared and delivered to your table."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, Apple Pay, Google Pay, and digital wallets through our secure Stripe integration."
    },
    {
      question: "How long does a session last?",
      answer: "A typical hookah session lasts 45-60 minutes. You can extend your session or order additional charcoal through the dashboard."
    },
    {
      question: "Can I change my flavor after ordering?",
      answer: "Flavor changes are possible before preparation starts. Once your session is being prepared, changes may incur additional charges."
    },
    {
      question: "What if I have technical issues?",
      answer: "Contact our support team immediately. We monitor all sessions and can provide real-time assistance or replacements if needed."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-gray-300 text-lg">
            Get help with your Hookah+ experience
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8">
          {[
            { id: 'faq', label: 'FAQ', icon: '❓' },
            { id: 'contact', label: 'Contact Us', icon: '📧' },
            { id: 'live-chat', label: 'Live Chat', icon: '💬' },
            { id: 'tickets', label: 'My Tickets', icon: '🎫' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 m-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/20 text-gray-300 hover:bg-white/30'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{item.question}</h3>
                    <p className="text-gray-300">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Support</h2>
              <form onSubmit={handleSubmitTicket} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={supportTicket.name}
                      onChange={(e) => setSupportTicket({...supportTicket, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={supportTicket.email}
                      onChange={(e) => setSupportTicket({...supportTicket, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={supportTicket.subject}
                    onChange={(e) => setSupportTicket({...supportTicket, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Priority</label>
                  <select
                    value={supportTicket.priority}
                    onChange={(e) => setSupportTicket({...supportTicket, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low - General question</option>
                    <option value="medium">Medium - Minor issue</option>
                    <option value="high">High - Urgent issue</option>
                    <option value="critical">Critical - Service down</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={supportTicket.message}
                    onChange={(e) => setSupportTicket({...supportTicket, message: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Please describe your issue in detail..."
                  />
                </div>

                {/* Trust-Lock Notice for Sensitive Issues */}
                {(supportTicket.subject.toLowerCase().includes('payment') ||
                  supportTicket.subject.toLowerCase().includes('account') ||
                  supportTicket.subject.toLowerCase().includes('refund') ||
                  supportTicket.priority === 'critical') && (
                  <div className="p-4 bg-yellow-500/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-400 text-xl mr-2">🔒</span>
                      <span className="text-yellow-400 font-semibold">Sensitive Issue Detected</span>
                    </div>
                    <p className="text-yellow-200 text-sm">
                      This type of issue requires additional verification. Our support team will contact you 
                      directly to verify your identity before processing your request.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                >
                  Submit Support Ticket
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Other Ways to Contact Us</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Email Support</h4>
                    <p className="text-gray-300 text-sm mb-2">support@hookahplus.net</p>
                    <p className="text-gray-400 text-xs">Response within 2 hours</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Phone Support</h4>
                    <p className="text-gray-300 text-sm mb-2">+1 (555) 123-HOOKAH</p>
                    <p className="text-gray-400 text-xs">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Chat Tab */}
        {activeTab === 'live-chat' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Live Chat Support</h2>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Chat with Support</h3>
                <p className="text-gray-300 mb-6">
                  Our support team is available for real-time assistance
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Start Live Chat
                </button>
                <p className="text-gray-400 text-sm mt-4">
                  Average response time: 2 minutes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">My Support Tickets</h2>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Tickets Yet</h3>
                <p className="text-gray-300 mb-6">
                  Your support tickets will appear here once you submit them
                </p>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Submit Your First Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
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