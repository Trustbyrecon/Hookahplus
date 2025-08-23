"use client";
import { useState } from 'react';
import GlobalNavigation from "../../components/GlobalNavigation";

type DemoStep = 'qr-scan' | 'flavor-selection' | 'checkout' | 'confirmation' | 'dashboard';

export default function DemoFlowPage() {
  const [currentStep, setCurrentStep] = useState<DemoStep>('qr-scan');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const flavors = [
    'Double Apple',
    'Mint',
    'Strawberry',
    'Grape',
    'Rose',
    'Vanilla',
    'Coconut',
    'Pineapple'
  ];

  const handleFlavorToggle = (flavor: string) => {
    setSelectedFlavors(prev => 
      prev.includes(flavor) 
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 'qr-scan') {
      setCurrentStep('flavor-selection');
    } else if (currentStep === 'flavor-selection') {
      setCurrentStep('checkout');
    } else if (currentStep === 'checkout') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep('confirmation');
      }, 2000);
    } else if (currentStep === 'confirmation') {
      setCurrentStep('dashboard');
    }
  };

  const resetDemo = () => {
    setCurrentStep('qr-scan');
    setSelectedFlavors([]);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <GlobalNavigation />
      
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Hookah+ Demo Flow</h1>
          <p className="text-zinc-400">Experience the customer journey from start to finish</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          {(['qr-scan', 'flavor-selection', 'checkout', 'confirmation', 'dashboard'] as DemoStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === step 
                  ? 'bg-teal-500 text-white' 
                  : index < ['qr-scan', 'flavor-selection', 'checkout', 'confirmation', 'dashboard'].indexOf(currentStep)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-700 text-zinc-400'
              }`}>
                {index + 1}
              </div>
              {index < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  index < ['qr-scan', 'flavor-selection', 'checkout', 'confirmation', 'dashboard'].indexOf(currentStep)
                    ? 'bg-emerald-500'
                    : 'bg-zinc-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* Step 1: QR Scan */}
        {currentStep === 'qr-scan' && (
          <div className="text-center">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 mb-8">
              <div className="text-8xl mb-6">📱</div>
              <h2 className="text-3xl font-bold text-white mb-4">Step 1: Customer Scans QR Code</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Customer scans the QR code at their table to start their session
              </p>
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-8 inline-block">
                <div className="text-6xl mb-4">📱</div>
                <div className="text-white font-bold text-lg">QR Code Scanner</div>
                <div className="text-zinc-400 text-sm">Point camera at table QR code</div>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              className="bg-teal-500 hover:bg-teal-400 text-zinc-950 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              Continue to Flavor Selection →
            </button>
          </div>
        )}

        {/* Step 2: Flavor Selection */}
        {currentStep === 'flavor-selection' && (
          <div className="text-center">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Step 2: Flavor Personalization</h2>
              <p className="text-zinc-400 text-lg mb-8">
                AI-powered flavor recommendations based on customer preferences
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {flavors.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => handleFlavorToggle(flavor)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedFlavors.includes(flavor)
                        ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
              {selectedFlavors.length > 0 && (
                <div className="mt-6 text-teal-300">
                  Selected: {selectedFlavors.join(', ')}
                </div>
              )}
            </div>
            <button
              onClick={handleNextStep}
              disabled={selectedFlavors.length === 0}
              className="bg-teal-500 hover:bg-teal-400 disabled:bg-zinc-600 disabled:cursor-not-allowed text-zinc-950 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              Continue to Checkout →
            </button>
          </div>
        )}

        {/* Step 3: Stripe Checkout */}
        {currentStep === 'checkout' && (
          <div className="text-center">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Step 3: Seamless Stripe Checkout</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Secure payment processing with real-time confirmation
              </p>
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-8 inline-block text-left">
                <div className="text-white">
                  <div className="text-2xl font-bold mb-4">Stripe Checkout</div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Base Session:</span>
                      <span>$15.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flavors ({selectedFlavors.length}):</span>
                      <span>${(selectedFlavors.length * 2).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-zinc-700 pt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${(15 + selectedFlavors.length * 2).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="bg-zinc-800 p-3 rounded text-sm">
                      💳 Card: **** **** **** 4242
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              className="bg-teal-500 hover:bg-teal-400 text-zinc-950 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              Process Payment →
            </button>
          </div>
        )}

        {/* Step 4: Payment Confirmation */}
        {currentStep === 'confirmation' && (
          <div className="text-center">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 mb-8">
              <div className="text-8xl mb-6 text-emerald-400">✅</div>
              <h2 className="text-3xl font-bold text-white mb-4">Step 4: Payment Confirmed!</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Customer receives instant confirmation and lounge staff is notified
              </p>
              <div className="bg-emerald-900/20 border border-emerald-500 rounded-xl p-6 inline-block">
                <div className="text-emerald-400 font-bold text-xl mb-2">Payment Successful!</div>
                <div className="text-emerald-300">
                  Amount: ${(15 + selectedFlavors.length * 2).toFixed(2)}<br/>
                  Transaction ID: txn_123456789<br/>
                  Status: Confirmed
                </div>
              </div>
              
              {/* FOH/BOH Integration Notice */}
              <div className="mt-6 bg-blue-900/20 border border-blue-500 rounded-xl p-6 max-w-md mx-auto">
                <div className="text-blue-400 font-bold text-lg mb-2">🔄 FOH/BOH Integration</div>
                <div className="text-blue-300 text-sm">
                  <div className="mb-2">✅ Payment confirmation sent to FOH dashboard</div>
                  <div className="mb-2">✅ Order queued in BOH prep room</div>
                  <div className="mb-2">✅ Real-time status updates across all systems</div>
                  <div className="text-xs text-blue-400 mt-3">
                    Check your FOH/BOH dashboards to see this order!
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              className="bg-teal-500 hover:bg-teal-400 text-zinc-950 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              View Lounge Dashboard →
            </button>
          </div>
        )}

        {/* Step 5: Dashboard Overview */}
        {currentStep === 'dashboard' && (
          <div className="text-center">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Step 5: Lounge Dashboard Overview</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Real-time session monitoring and customer insights
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
                  <div className="text-3xl mb-2">🟢</div>
                  <div className="text-2xl font-bold text-emerald-400">3</div>
                  <div className="text-zinc-400">Active Sessions</div>
                </div>
                <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-blue-400">$47.00</div>
                  <div className="text-zinc-400">Today's Revenue</div>
                </div>
                <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-2xl font-bold text-purple-400">12</div>
                  <div className="text-zinc-400">Customers Served</div>
                </div>
              </div>
              <div className="mt-8 bg-zinc-800 rounded-xl border border-zinc-700 p-6 text-left">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Table 3 - Payment confirmed</span>
                    <span className="text-emerald-400">+$23.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Table 1 - Session started</span>
                    <span className="text-blue-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Table 5 - Flavor added</span>
                    <span className="text-purple-400">+$2.00</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetDemo}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                🔄 Restart Demo
              </button>
              <a
                href="/sessions"
                className="bg-teal-500 hover:bg-teal-400 text-zinc-950 px-6 py-3 rounded-xl font-medium transition-colors"
              >
                🚀 Try Live System
              </a>
              <a
                href="/owner-cta?form=preorder"
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-3 rounded-xl font-medium transition-colors"
              >
                💳 Start Preorders
              </a>
            </div>
          </div>
        )}

        {/* Mobile Workflow Simulation */}
        <div className="mt-12 bg-zinc-900 rounded-xl border border-zinc-800 p-8">
          <h3 className="text-2xl font-bold text-cyan-300 mb-6 text-center">🎬 Live Mobile Workflow Simulation</h3>
          <p className="text-zinc-400 mb-6 text-center">Watch a customer go through the complete QR workflow in real-time</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mobile Order Status */}
            <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
              <h4 className="text-lg font-semibold text-pink-300 mb-4">📱 Mobile Order Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Order ID:</span>
                  <span className="font-mono text-sm text-pink-400">ord_123456</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Table:</span>
                  <span className="text-emerald-400">T-3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Status:</span>
                  <span className="bg-emerald-900 text-emerald-300 px-2 py-1 rounded text-sm">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Flavor:</span>
                  <span className="text-blue-400">Double Apple + Mint</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Amount:</span>
                  <span className="text-yellow-400">$23.00</span>
                </div>
              </div>
            </div>

            {/* Mobile Workflow Progress */}
            <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
              <h4 className="text-lg font-semibold text-cyan-300 mb-4">📊 Mobile Workflow Progress</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-zinc-300">QR Code Scanned</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-zinc-300">Flavor Selected</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-zinc-300">Payment Processed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-400">Order Confirmed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                  <span className="text-zinc-500">Session Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm mb-4">
              💡 <strong>Pro Tip:</strong> Mobile orders appear automatically when customers complete QR workflow
            </p>
            <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-4 inline-block">
              <div className="text-sm text-zinc-300">
                <div className="text-emerald-400 font-medium">Real-time Integration</div>
                <div className="text-zinc-400">Orders sync instantly with FOH/BOH dashboards</div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
              <div className="text-4xl mb-4 animate-spin">💳</div>
              <div className="text-xl text-white mb-2">Processing Payment...</div>
              <div className="text-zinc-400">Please wait while we confirm your transaction</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
