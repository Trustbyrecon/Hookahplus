'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  CreditCard,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Crown,
  Sparkles,
  Target,
  TrendingUp,
  Lock
} from 'lucide-react';

export default function HitTrustPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    currentSystem: '',
    integrationNeeds: '',
    timeline: '',
    message: ''
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
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Trust-Lock Security',
      description: 'Enterprise-grade security with TLH-v1 encryption',
      color: 'text-green-400'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Sync',
      description: 'Instant data synchronization across all systems',
      color: 'text-blue-400'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Multi-User Access',
      description: 'Role-based access control for your entire team',
      color: 'text-purple-400'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Payment Integration',
      description: 'Seamless payment processing and reconciliation',
      color: 'text-orange-400'
    }
  ];

  const benefits = [
    {
      title: 'Early Access',
      description: 'Be among the first to experience HitTrust integration',
      icon: <Crown className="w-5 h-5" />
    },
    {
      title: 'Priority Support',
      description: 'Dedicated support team for HitTrust partners',
      icon: <Star className="w-5 h-5" />
    },
    {
      title: 'Custom Pricing',
      description: 'Exclusive pricing for early adopters',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      title: 'Beta Features',
      description: 'Access to cutting-edge features before public release',
      icon: <Sparkles className="w-5 h-5" />
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-400" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to HitTrust!</h2>
          <p className="text-zinc-300 mb-6">
            Thank you for joining the HitTrust waitlist. We'll be in touch soon with exclusive early access details.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-zinc-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>You're on the priority list</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-zinc-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Early access details coming soon</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-zinc-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Exclusive pricing available</span>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-3 mb-6"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold">HitTrust Integration</h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-zinc-300 mb-8 max-w-3xl mx-auto"
            >
              Join the exclusive HitTrust waitlist and be among the first to experience 
              the future of hookah lounge management integration.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center space-x-6 text-sm text-zinc-400"
            >
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-green-400" />
                <span>TLH-v1 Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Real-time Sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-purple-400" />
                <span>Early Access</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">HitTrust Features</h2>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className={`w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-zinc-300">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Early Access Benefits</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-zinc-800/50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{benefit.title}</h3>
                    <p className="text-sm text-zinc-300">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Waitlist Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Join the HitTrust Waitlist</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                    placeholder="Your business name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                    placeholder="your@email.com"
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
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Select business type</option>
                    <option value="hookah-lounge">Hookah Lounge</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="bar">Bar/Nightclub</option>
                    <option value="cafe">Cafe</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Current System
                  </label>
                  <input
                    type="text"
                    name="currentSystem"
                    value={formData.currentSystem}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                    placeholder="Current POS or management system"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Integration Needs
                </label>
                <textarea
                  name="integrationNeeds"
                  value={formData.integrationNeeds}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                  placeholder="Describe your integration requirements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Timeline
                </label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select timeline</option>
                  <option value="immediate">Immediate (within 1 month)</option>
                  <option value="short">Short term (1-3 months)</option>
                  <option value="medium">Medium term (3-6 months)</option>
                  <option value="long">Long term (6+ months)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Additional Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-primary-500"
                  placeholder="Tell us more about your business and integration goals..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-zinc-600 disabled:to-zinc-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Joining HitTrust...</span>
                  </>
                ) : (
                  <>
                    <span>Join HitTrust Waitlist</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
