'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Building,
  Users,
  CreditCard,
  Calendar,
  MessageSquare,
  Star,
  Zap
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    loungeName: '',
    location: '',
    currentPOS: '',
    integrationType: '',
    timeline: '',
    message: '',
    pricingModel: 'time-based'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const pricingModels = [
    {
      id: 'time-based',
      name: 'Time-Based Pricing',
      description: 'Pay per minute of session time',
      features: ['Flexible pricing', 'Real-time tracking', 'Automatic billing'],
      recommended: true
    },
    {
      id: 'flat-rate',
      name: 'Flat Rate Pricing',
      description: 'Fixed price per session',
      features: ['Simple pricing', 'Predictable costs', 'Easy management'],
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Contact Us for Demo
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
            Experience Hookah+ in your lounge. Schedule a personalized demo and see how our system can transform your business.
          </p>
        </div>

        {/* Pricing Model Notice */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Integration Limitations</h3>
              <p className="text-zinc-300 mb-3">
                Currently, our POS integration is limited to <strong>time-based pricing</strong> and <strong>flat-rate pricing</strong> models only. 
                Complex pricing structures and custom billing integrations are not available at this time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pricingModels.map((model) => (
                  <div key={model.id} className={`p-4 rounded-lg border ${
                    model.recommended 
                      ? 'border-green-500/30 bg-green-500/10' 
                      : 'border-zinc-600 bg-zinc-800/50'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-white">{model.name}</h4>
                      {model.recommended && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mb-3">{model.description}</p>
                    <ul className="space-y-1">
                      {model.features.map((feature, index) => (
                        <li key={index} className="text-xs text-zinc-300 flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Request a Demo</h2>
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Demo Request Submitted!</h3>
                <p className="text-zinc-400 mb-6">
                  Thank you for your interest. We'll contact you within 24 hours to schedule your personalized demo.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      company: '',
                      phone: '',
                      loungeName: '',
                      location: '',
                      currentPOS: '',
                      integrationType: '',
                      timeline: '',
                      message: '',
                      pricingModel: 'time-based'
                    });
                  }}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Lounge Information */}
                <div className="border-t border-zinc-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Building className="w-5 h-5 text-primary-400" />
                    <span>Lounge Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Lounge Name *
                      </label>
                      <input
                        type="text"
                        name="loungeName"
                        value={formData.loungeName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                        placeholder="The Cloud Lounge"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>
                </div>

                {/* Integration Details */}
                <div className="border-t border-zinc-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-primary-400" />
                    <span>Integration Details</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Current POS System
                      </label>
                      <select
                        name="currentPOS"
                        value={formData.currentPOS}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      >
                        <option value="">Select your current POS</option>
                        <option value="square">Square</option>
                        <option value="toast">Toast</option>
                        <option value="clover">Clover</option>
                        <option value="stripe">Stripe Terminal</option>
                        <option value="other">Other</option>
                        <option value="none">No current POS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Preferred Pricing Model *
                      </label>
                      <div className="space-y-2">
                        {pricingModels.map((model) => (
                          <label key={model.id} className="flex items-center space-x-3 p-3 bg-zinc-700/50 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors">
                            <input
                              type="radio"
                              name="pricingModel"
                              value={model.id}
                              checked={formData.pricingModel === model.id}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-primary-600"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-white">{model.name}</span>
                                {model.recommended && (
                                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-zinc-400">{model.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Timeline for Implementation
                      </label>
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      >
                        <option value="">Select timeline</option>
                        <option value="immediate">Immediate (within 1 month)</option>
                        <option value="short">Short term (1-3 months)</option>
                        <option value="medium">Medium term (3-6 months)</option>
                        <option value="long">Long term (6+ months)</option>
                        <option value="exploring">Just exploring options</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Additional Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                    placeholder="Tell us about your specific needs, questions, or any other information..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-zinc-600 disabled:to-zinc-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Request Demo</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-zinc-400">demo@hookahplus.net</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-white font-medium">Phone</p>
                    <p className="text-zinc-400">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-white font-medium">Business Hours</p>
                    <p className="text-zinc-400">Mon-Fri: 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Benefits */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">What to Expect</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Personalized Demo</p>
                    <p className="text-zinc-400 text-sm">See Hookah+ tailored to your lounge's needs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Integration Assessment</p>
                    <p className="text-zinc-400 text-sm">We'll evaluate your current POS compatibility</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Custom Pricing</p>
                    <p className="text-zinc-400 text-sm">Get a tailored quote for your lounge</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Implementation Plan</p>
                    <p className="text-zinc-400 text-sm">Detailed roadmap for your integration</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">What Our Partners Say</h3>
              <div className="space-y-4">
                <div className="bg-zinc-900/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-sm mb-2">
                    "Hookah+ transformed our customer experience. The flavor wheel is a game-changer."
                  </p>
                  <p className="text-zinc-400 text-xs">- Sarah M., Cloud Lounge NYC</p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-sm mb-2">
                    "The integration was seamless. Our staff loves the new system."
                  </p>
                  <p className="text-zinc-400 text-xs">- Mike C., Downtown Hookah</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
