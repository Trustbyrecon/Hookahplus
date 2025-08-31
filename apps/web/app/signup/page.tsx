"use client";
import { useState } from "react";
import Link from "next/link";

type BusinessType = "lounge" | "restaurant" | "bar" | "cafe" | "other";
type ServiceLevel = "basic" | "premium" | "enterprise";

interface SignupForm {
  businessName: string;
  businessType: BusinessType;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceLevel: ServiceLevel;
  estimatedRevenue: string;
  currentCustomers: string;
  message: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupForm>({
    businessName: "",
    businessType: "lounge",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    serviceLevel: "basic",
    estimatedRevenue: "",
    currentCustomers: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field: keyof SignupForm, value: string | BusinessType | ServiceLevel) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Track signup event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'sign_up', {
        method: 'web_form',
        business_type: formData.businessType,
        service_level: formData.serviceLevel
      });
    }

    setSubmitSuccess(true);
    setIsSubmitting(false);
  };

  const getServiceLevelDetails = (level: ServiceLevel) => {
    switch (level) {
      case "basic":
        return {
          name: "Basic",
          price: "$99/month",
          features: ["Session Management", "Basic Analytics", "Email Support", "Mobile App"]
        };
      case "premium":
        return {
          name: "Premium",
          price: "$199/month",
          features: ["Advanced Analytics", "Priority Support", "Custom Branding", "API Access", "Staff Training"]
        };
      case "enterprise":
        return {
          name: "Enterprise",
          price: "Custom Pricing",
          features: ["Full Customization", "Dedicated Support", "White-label Solution", "On-site Training", "Custom Integrations"]
        };
    }
  };

  const currentService = getServiceLevelDetails(formData.serviceLevel);

  if (submitSuccess) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">
              Thank You for Your Interest!
            </h1>

            <p className="text-xl text-gray-300 mb-8">
              We've received your application and our team will contact you within 24 hours to discuss how Hookah+ can transform your business.
            </p>

            <div className="bg-white/20 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-teal-300 mb-3">What's Next?</h3>
              <div className="text-left space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Review your business requirements</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Schedule a personalized demo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Discuss pricing and implementation</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Return Home
              </Link>
              
              <div className="pt-4">
                <Link
                  href="/demo"
                  className="text-teal-400 hover:text-teal-300 underline"
                >
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Get Started with Hookah+</h1>
              <p className="text-zinc-400">Transform your business with intelligent session management</p>
            </div>
            <div className="flex gap-4">
              <Link href="/demo" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                🎬 Demo
              </Link>
              <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                🏠 Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Signup Form */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
              <h2 className="text-2xl font-semibold text-teal-300 mb-6">Business Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Business Type *
                    </label>
                    <select
                      required
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value as BusinessType)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="lounge">Hookah Lounge</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="bar">Bar</option>
                      <option value="cafe">Cafe</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      placeholder="Your Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Service Level *
                    </label>
                    <select
                      required
                      value={formData.serviceLevel}
                      onChange={(e) => handleInputChange('serviceLevel', e.target.value as ServiceLevel)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="basic">Basic - $99/month</option>
                      <option value="premium">Premium - $199/month</option>
                      <option value="enterprise">Enterprise - Custom</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="123 Business St"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      placeholder="12345"
                    />
                  </div>
                </div>

                {/* Business Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Estimated Monthly Revenue
                    </label>
                    <select
                      value={formData.estimatedRevenue}
                      onChange={(e) => handleInputChange('estimatedRevenue', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">Select Range</option>
                      <option value="under-10k">Under $10,000</option>
                      <option value="10k-25k">$10,000 - $25,000</option>
                      <option value="25k-50k">$25,000 - $50,000</option>
                      <option value="50k-100k">$50,000 - $100,000</option>
                      <option value="over-100k">Over $100,000</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Current Customer Base
                    </label>
                    <select
                      value={formData.currentCustomers}
                      onChange={(e) => handleInputChange('currentCustomers', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">Select Range</option>
                      <option value="under-100">Under 100</option>
                      <option value="100-500">100 - 500</option>
                      <option value="500-1000">500 - 1,000</option>
                      <option value="1000-5000">1,000 - 5,000</option>
                      <option value="over-5000">Over 5,000</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="Tell us about your business needs, current challenges, or any specific requirements..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </button>

                <p className="text-xs text-zinc-500 text-center">
                  By submitting this form, you agree to our terms of service and privacy policy.
                </p>
              </form>
            </div>
          </div>

          {/* Service Level Details */}
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">
                {currentService.name} Plan
              </h3>
              <div className="text-3xl font-bold text-white mb-2">
                {currentService.price}
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                {currentService.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-teal-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">Why Choose Hookah+?</h3>
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">🚀</span>
                  <span>Increase revenue by 30%+ with smart session management</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">⚡</span>
                  <span>Reduce operational costs with automated workflows</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">📱</span>
                  <span>Modern mobile app for staff and customers</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">🔒</span>
                  <span>Enterprise-grade security and compliance</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">📊</span>
                  <span>Real-time analytics and business insights</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">Get Started Today</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Join hundreds of successful businesses already using Hookah+ to transform their operations.
              </p>
              <Link
                href="/demo"
                className="block w-full bg-teal-600 hover:bg-teal-700 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                🎬 Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
