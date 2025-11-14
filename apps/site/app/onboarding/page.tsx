'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import PageHero from '../../components/PageHero';
import { trackOnboardingSignup } from '../../lib/ctaTracking';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Building,
  Users,
  MapPin,
  Clock,
  Settings,
  Shield,
  Zap,
  Check,
  CreditCard
} from 'lucide-react';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    location: '',
    
    // Step 2: Lounge Details
    seatingTypes: [] as string[],
    totalCapacity: '',
    numberOfTables: '',
    averageSessionDuration: '',
    
    // Step 3: Current Systems
    currentPOS: '',
    currentManagementSystem: '',
    integrationNeeds: '',
    
    // Step 4: Preferences
    pricingModel: 'time-based',
    preferredFeatures: [] as string[]
  });

  const seatingTypesOptions = [
    'Booths',
    'Couches',
    'Bar Seating',
    'Outdoor Seating',
    'VIP Sections',
    'Private Rooms'
  ];

  const preferredFeaturesOptions = [
    'QR Code Ordering',
    'Flavor Wheel',
    'Staff Management',
    'Advanced Analytics',
    'Loyalty Program',
    'Mobile App Access'
  ];

  const steps = [
    { number: 1, title: 'Basic Information', icon: <Building className="w-5 h-5" /> },
    { number: 2, title: 'Lounge Details', icon: <Users className="w-5 h-5" /> },
    { number: 3, title: 'Current Systems', icon: <Settings className="w-5 h-5" /> },
    { number: 4, title: 'Preferences', icon: <Shield className="w-5 h-5" /> }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: 'seatingTypes' | 'preferredFeatures', value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Track CTA event with form data
      trackOnboardingSignup({
        name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        location: formData.location
      }, {
        step: currentStep,
        totalSteps: steps.length,
        seatingTypes: formData.seatingTypes,
        currentPOS: formData.currentPOS,
        pricingModel: formData.pricingModel
      });

      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'onboarding_submission',
          data: formData
        }),
      });

      if (response.ok) {
        // Redirect to Operator Onboarding Management in app build
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        window.location.href = `${appUrl}/admin/operator-onboarding?source=onboarding&email=${encodeURIComponent(formData.email)}`;
      } else {
        alert('Failed to submit onboarding. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      alert('Failed to submit onboarding. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Tell Us About Your Business</h2>
            
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
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="Your Hookah Lounge Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Owner/Manager Name *
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="Your Full Name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
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
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="City, State"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Lounge Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">
                Seating Types * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {seatingTypesOptions.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 p-3 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.seatingTypes.includes(type)}
                      onChange={() => handleCheckboxChange('seatingTypes', type)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-zinc-300">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Total Capacity *
                </label>
                <input
                  type="number"
                  name="totalCapacity"
                  value={formData.totalCapacity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Number of Tables *
                </label>
                <input
                  type="number"
                  name="numberOfTables"
                  value={formData.numberOfTables}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                  placeholder="12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Avg. Session Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="averageSessionDuration"
                  value={formData.averageSessionDuration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                  placeholder="90"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Current Systems</h2>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Current POS System
              </label>
              <input
                type="text"
                name="currentPOS"
                value={formData.currentPOS}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="Square, Toast, Clover, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Current Management System
              </label>
              <input
                type="text"
                name="currentManagementSystem"
                value={formData.currentManagementSystem}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="Resy, OpenTable, Custom, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Integration Needs
              </label>
              <textarea
                name="integrationNeeds"
                value={formData.integrationNeeds}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none resize-none"
                placeholder="Describe any specific integration requirements..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Preferences</h2>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">
                Preferred Pricing Model *
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                  <input
                    type="radio"
                    name="pricingModel"
                    value="time-based"
                    checked={formData.pricingModel === 'time-based'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-semibold text-white">Time-Based</div>
                    <div className="text-sm text-zinc-400">Charge based on session duration</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                  <input
                    type="radio"
                    name="pricingModel"
                    value="flat-rate"
                    checked={formData.pricingModel === 'flat-rate'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-semibold text-white">Flat Rate</div>
                    <div className="text-sm text-zinc-400">Fixed price per session</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">
                Preferred Features (Select all that interest you)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {preferredFeaturesOptions.map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center gap-2 p-3 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferredFeatures.includes(feature)}
                      onChange={() => handleCheckboxChange('preferredFeatures', feature)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-zinc-300">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <PageHero
        headline="Get your lounge running in 15 minutes"
        subheadline="AI-powered setup learns your flow, optimizes automatically"
        benefit={{
          value: "40% reduction in setup time",
          description: "vs manual configuration — AI handles the heavy lifting",
          icon: <Zap className="w-6 h-6 text-teal-400" />
        }}
        trustIndicators={[
          { icon: <Clock className="w-4 h-4 text-teal-400" />, text: "30-day pilot available" },
          { icon: <CreditCard className="w-4 h-4 text-teal-400" />, text: "No credit card required" },
          { icon: <Shield className="w-4 h-4 text-teal-400" />, text: "Cancel anytime" }
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep === step.number
                      ? 'bg-teal-500 text-white'
                      : currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className={`text-xs text-center ${
                    currentStep === step.number ? 'text-white font-semibold' : 'text-zinc-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-zinc-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="p-8 mb-8">
          {renderStepContent()}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {currentStep < steps.length ? (
            <Button
              variant="primary"
              onClick={handleNext}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
            >
              Complete Onboarding
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

