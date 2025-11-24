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
  CreditCard,
  Mail,
  Image as ImageIcon,
  DollarSign,
  HelpCircle,
  Sparkles,
  Link as LinkIcon
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
    preferredFeatures: [] as string[],

    // Menu & pricing
    baseHookahPrice: '',
    refillPrice: '',
    menuLink: ''
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
      // Validate required fields
      if (
        !formData.email ||
        !formData.businessName ||
        !formData.ownerName ||
        !formData.baseHookahPrice
      ) {
        alert('Please fill in all required fields (Business Name, Owner Name, Email, and Base Hookah Price).');
        return;
      }

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

      const responseData = await response.json().catch(() => ({ error: 'Failed to parse response' }));

      if (response.ok && responseData.success) {
        // Show success message and stay on site build
        // Users should never see the admin Operator Onboarding Management page
        // Show success state (we'll add a success step or message)
        alert('✅ Thank you! Your onboarding request has been submitted successfully. Our team will contact you shortly.');
        // Optionally reset form or redirect to home
        window.location.href = '/';
      } else {
        const errorMessage = responseData.error || responseData.message || 'Failed to submit onboarding. Please try again.';
        console.error('Onboarding submission error:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit onboarding. Please try again.';
      alert(`Error: ${errorMessage}`);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Base Hookah Price (USD) *
                </label>
                <input
                  type="number"
                  name="baseHookahPrice"
                  value={formData.baseHookahPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Refill Price (optional)
                </label>
                <input
                  type="number"
                  name="refillPrice"
                  value={formData.refillPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Link to your current menu (optional)
              </label>
              <input
                type="url"
                name="menuLink"
                value={formData.menuLink}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="Instagram, website, or PDF link"
              />
              <p className="mt-2 text-xs text-zinc-500">
                You can also email photos or a PDF; the link just helps us start faster.
              </p>
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
        headline="Get your lounge running in 15 minutes."
        subheadline="Send us your menu and base price. We configure Hookah+ for your floor and send you one test link your staff can click through in under 15 minutes."
        benefit={{
          value: 'One test link',
          description: 'Staff-ready demo in 10–15 minutes',
          icon: <Sparkles className="w-6 h-6 text-teal-400" />
        }}
        trustIndicators={[
          { icon: <Clock className="w-4 h-4 text-teal-400" />, text: '30-day pilot available' },
          { icon: <CreditCard className="w-4 h-4 text-teal-400" />, text: 'No credit card required' },
          { icon: <Shield className="w-4 h-4 text-teal-400" />, text: 'Cancel anytime' }
        ]}
      />

      {/* Test link story: what you send, what we send back, how staff use it */}
      <div className="max-w-6xl mx-auto px-4 pt-8 sm:px-6 lg:px-8 space-y-10">
        {/* What you send us */}
        <section id="send-menu" className="grid gap-6 md:grid-cols-3">
          <Card className="bg-zinc-900/60 border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-teal-400" />
              <h2 className="text-lg font-semibold">1. Your menu & flavors</h2>
            </div>
            <p className="text-sm text-zinc-300 mb-3">
              Email or upload a photo, PDF, or link to your current menu and flavor list.
            </p>
            <p className="text-xs text-zinc-500">
              We use this to pre-build your flavor wheel and session cards.
            </p>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-teal-400" />
              <h2 className="text-lg font-semibold">2. Your base hookah price</h2>
            </div>
            <p className="text-sm text-zinc-300 mb-3">
              Tell us your base hookah price and whether you lean flat or time-based.
            </p>
            <p className="text-xs text-zinc-500">
              We configure simple pricing rules so sessions feel natural for your floor.
            </p>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="w-6 h-6 text-teal-400" />
              <h2 className="text-lg font-semibold">3. Optional lounge photos</h2>
            </div>
            <p className="text-sm text-zinc-300 mb-3">
              Share a few photos of your VIP, patio, or main floor if you’d like us to mirror zones.
            </p>
            <p className="text-xs text-zinc-500">
              This lets us pre-label tables and sections so staff recognize the screen instantly.
            </p>
          </Card>
        </section>

        {/* What we send back – test link */}
        <section className="grid gap-8 lg:grid-cols-[3fr,2fr] items-start">
          <Card className="bg-zinc-900/60 border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <LinkIcon className="w-6 h-6 text-teal-400" />
              <h2 className="text-xl font-semibold">We send you one test link.</h2>
            </div>
            <p className="text-sm text-zinc-300 mb-4">
              Your test link opens a private Fire Session Dashboard for <span className="font-semibold">your</span> lounge in
              demo mode—no installs, no passwords, no real charges.
            </p>
            <ol className="space-y-3 text-sm text-zinc-300 mb-4 list-decimal list-inside">
              <li>Open the link on a FOH or BOH tablet.</li>
              <li>
                Click through tonight’s flow:{' '}
                <span className="text-zinc-100">
                  New → Prep → Heat Up → Ready for Delivery → Out for Delivery → Active → Close
                </span>
                .
              </li>
              <li>See if the floor feels smoother and staff can read the screen in under 10 minutes.</li>
            </ol>
            <p className="text-xs text-zinc-500">
              Most owners never touch a dashboard builder. You send inputs; we handle configuration and send the link.
            </p>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-semibold text-white">What your staff see</h3>
            </div>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5" />
                <span>Clean BOH/FOH tabs that show who needs coals, refills, or close-out.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5" />
                <span>Session cards with your flavors, tables, and simple next-step buttons.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5" />
                <span>A &quot;Demo Mode&quot; banner so everyone knows it’s safe to tap everything.</span>
              </li>
            </ul>
            <Button
              variant="primary"
              className="mt-2 bg-teal-600 hover:bg-teal-700 w-full justify-center"
            >
              Talk about my test link
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </section>

        {/* FAQ focused on the test link */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-zinc-900/60 border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-semibold">What is the test link?</h2>
            </div>
            <p className="text-sm text-zinc-300 mb-3">
              It’s a private URL that opens your lounge’s Fire Session Dashboard in <span className="font-semibold">demo mode</span>.
              No installs, no passwords, no real payments—just your floor, simulated.
            </p>
            <p className="text-sm text-zinc-300">
              Your team can open it on a tablet, run through a mock busy night in 10–15 minutes, and decide if Hookah+ makes
              their shift feel smoother or not.
            </p>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-semibold">Do I need IT or POS integration?</h2>
            </div>
            <p className="text-sm text-zinc-300 mb-3">
              No. The test link runs stand-alone. You don’t need to change your POS or wire anything into payments just to try it.
            </p>
            <p className="text-sm text-zinc-300">
              If you like how the floor feels, we can later talk about deeper POS or payment integrations—but that’s optional.
            </p>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-semibold">How long does setup take?</h2>
            </div>
            <p className="text-sm text-zinc-300 mb-3">
              Once you send your menu and base price, we aim to send your test link within <span className="font-semibold">24–48 hours</span>.
            </p>
            <p className="text-sm text-zinc-300">
              Most owners only need to approve the final layout—not build it. Implementation on your side is basically
              &quot;send us your menu and approve the test link.&quot;
            </p>
          </Card>

          <Card className="bg-zinc-900/60 border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-semibold">What should my staff do with it?</h2>
            </div>
            <p className="text-sm text-zinc-300 mb-3">
              Ask a manager and one FOH + one BOH staff member to:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-zinc-300 mb-3">
              <li>Open the test link at a quiet time.</li>
              <li>Walk through 2–3 fake sessions from New → Close.</li>
              <li>Tell you in plain language if it makes their night feel easier.</li>
            </ol>
          </Card>
        </section>
      </div>

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

