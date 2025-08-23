"use client";
import { useState, useEffect } from 'react';

type FormType = 'demo' | 'waitlist' | 'preorder';

export default function OwnerCTAPage() {
  const [activeForm, setActiveForm] = useState<FormType>('demo');

  // Handle URL parameters for pre-selecting forms
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const formParam = urlParams.get('form');
    if (formParam === 'preorder') {
      setActiveForm('preorder');
    } else if (formParam === 'waitlist') {
      setActiveForm('waitlist');
    } else if (formParam === 'demo') {
      setActiveForm('demo');
    }
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    loungeName: '',
    city: '',
    currentPOS: '',
    estimatedRevenue: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let endpoint = '';
      let payload = {};
      
      switch (activeForm) {
        case 'demo':
          endpoint = '/api/demo-requests';
          payload = {
            action: 'request_demo',
            data: {
              name: formData.name,
              email: formData.email,
              loungeName: formData.loungeName,
              city: formData.city,
              message: formData.message
            }
          };
          break;
          
        case 'waitlist':
          endpoint = '/api/pos-waitlist';
          payload = {
            action: 'join_waitlist',
            data: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
                             loungeName: formData.loungeName,
              city: formData.city,
              currentPOS: formData.currentPOS,
              estimatedRevenue: formData.estimatedRevenue
            }
          };
          break;
          
        case 'preorder':
          endpoint = '/api/preorder-signup';
          payload = {
            action: 'signup_preorder',
            data: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              loungeName: formData.loungeName,
              city: formData.city,
              estimatedRevenue: formData.estimatedRevenue
            }
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          loungeName: '',
          city: '',
          currentPOS: '',
          estimatedRevenue: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-teal-400 mb-2">Get Started with Hookah+</h1>
          <p className="text-zinc-400 text-xl">Choose your path to lounge transformation</p>
        </div>
      </div>

      {/* CTA Options */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Demo Request */}
          <div 
            className={`cursor-pointer transition-all duration-300 ${
              activeForm === 'demo' 
                ? 'bg-gradient-to-br from-teal-900 to-teal-800 border-2 border-teal-500 scale-105' 
                : 'bg-zinc-800 border-2 border-zinc-700 hover:border-teal-500'
            } rounded-xl p-6`}
            onClick={() => setActiveForm('demo')}
          >
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">See Demo</h3>
            <p className="text-zinc-300 text-sm">
              Experience the full Hookah+ system with personalized walkthrough
            </p>
          </div>

          {/* POS Waitlist */}
          <div 
            className={`cursor-pointer transition-all duration-300 ${
              activeForm === 'waitlist' 
                ? 'bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-500 scale-105' 
                : 'bg-zinc-800 border-2 border-zinc-700 hover:border-blue-500'
            } rounded-xl p-6`}
            onClick={() => setActiveForm('waitlist')}
          >
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-bold text-white mb-2">POS Waitlist</h3>
            <p className="text-zinc-300 text-sm">
              Join the queue for early access to our POS integration
            </p>
          </div>

          {/* Start Preorders */}
          <div 
            className={`cursor-pointer transition-all duration-300 ${
              activeForm === 'preorder' 
                ? 'bg-gradient-to-br from-green-900 to-green-800 border-2 border-green-500 scale-105' 
                : 'bg-zinc-800 border-2 border-zinc-700 hover:border-green-500'
            } rounded-xl p-6`}
            onClick={() => setActiveForm('preorder')}
          >
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">Start Preorders</h3>
            <p className="text-zinc-300 text-sm">
              Begin accepting preorders with Stripe integration today
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700">
          {/* Demo Request Form */}
          {activeForm === 'demo' && (
            <div>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-3xl font-bold text-teal-400 mb-2">Request Personalized Demo</h2>
                <p className="text-zinc-400 text-lg">Get a customized walkthrough of Hookah+ for your lounge</p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Lounge Name *</label>
                    <input
                      type="text"
                      name="loungeName"
                      value={formData.loungeName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                      placeholder="Your lounge name"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                      placeholder="City, State"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                    placeholder="Tell us about your lounge and what you're looking for..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-600 text-white py-4 rounded-xl text-xl font-bold transition-colors"
                >
                  {isSubmitting ? 'Sending Request...' : 'Request Demo'}
                </button>
              </form>
            </div>
          )}

          {/* POS Waitlist Form */}
          {activeForm === 'waitlist' && (
            <div>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-3xl font-bold text-blue-400 mb-2">Join POS Waitlist</h2>
                <p className="text-zinc-400 text-lg">Get priority access to our POS integration system</p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Lounge Name *</label>
                    <input
                      type="text"
                      name="loungeName"
                      value={formData.loungeName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Your lounge name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Current POS</label>
                    <select
                      name="currentPOS"
                      value={formData.currentPOS}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select current POS</option>
                      <option value="clover">Clover</option>
                      <option value="toast">Toast</option>
                      <option value="square">Square</option>
                      <option value="aloha">Aloha</option>
                      <option value="micros">Micros</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Estimated Monthly Revenue</label>
                  <select
                    name="estimatedRevenue"
                    value={formData.estimatedRevenue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select revenue range</option>
                    <option value="under-10k">Under $10,000</option>
                    <option value="10k-25k">$10,000 - $25,000</option>
                    <option value="25k-50k">$25,000 - $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="over-100k">Over $100,000</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white py-4 rounded-xl text-xl font-bold transition-colors"
                >
                  {isSubmitting ? 'Joining Waitlist...' : 'Join Waitlist'}
                </button>
              </form>
            </div>
          )}

          {/* Preorder Signup Form */}
          {activeForm === 'preorder' && (
            <div>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🚀</div>
                <h2 className="text-3xl font-bold text-green-400 mb-2">Start Accepting Preorders</h2>
                <p className="text-zinc-400 text-lg">Begin using Hookah+ with Stripe integration today</p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Lounge Name *</label>
                    <input
                      type="text"
                      name="loungeName"
                      value={formData.loungeName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                      placeholder="Your lounge name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Estimated Monthly Revenue</label>
                    <select
                      name="estimatedRevenue"
                      value={formData.estimatedRevenue}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="">Select revenue range</option>
                      <option value="under-10k">Under $10,000</option>
                      <option value="10k-25k">$10,000 - $25,000</option>
                      <option value="25k-50k">$25,000 - $50,000</option>
                      <option value="50k-100k">$50,000 - $100,000</option>
                      <option value="over-100k">Over $100,000</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white py-4 rounded-xl text-xl font-bold transition-colors"
                >
                  {isSubmitting ? 'Setting Up...' : 'Start Preorders'}
                </button>
              </form>
            </div>
          )}

          {/* Success/Error Messages */}
          {submitStatus === 'success' && (
            <div className="mt-6 bg-green-900/20 border border-green-500 rounded-lg p-4 text-center">
              <div className="text-green-400 font-semibold text-lg mb-2">✅ Request Submitted!</div>
              <div className="text-green-200">
                We'll be in touch within 24 hours to discuss your needs.
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mt-6 bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
              <div className="text-red-400 font-semibold text-lg mb-2">❌ Submission Failed</div>
              <div className="text-red-200">
                Please try again or contact us directly at support@hookahplus.com
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-zinc-900 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-2xl font-bold text-white mb-6">Why Choose Hookah+?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-teal-300 mb-2">Quick Setup</h3>
              <p className="text-zinc-400 text-sm">Get started in minutes, not weeks</p>
            </div>
            <div>
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">Enterprise Security</h3>
              <p className="text-zinc-400 text-sm">Bank-level security and compliance</p>
            </div>
            <div>
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Mobile First</h3>
              <p className="text-zinc-400 text-sm">Optimized for modern devices</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
