"use client";

import { useState } from "react";

export default function PreOrderPage() {
  const [selectedFlavor, setSelectedFlavor] = useState("Blue Mist + Mint");
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const flavors = [
    "Blue Mist + Mint",
    "Double Apple",
    "Grape Mint",
    "Watermelon",
    "Peach",
    "Strawberry",
    "Mint",
    "Rose"
  ];

  const calculateTotal = () => {
    const basePrice = 30.00;
    return (basePrice * quantity).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Pre-Order Your Hookah Experience
          </h1>
          <p className="text-xl text-teal-100 mb-8">
            Skip the wait, secure your spot, and enjoy premium hookah service
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">⚡ Instant Confirmation</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">🎯 Table Reserved</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">💳 Secure Payment</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Quick Order Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-teal-300 mb-3">Quick Order</h3>
            <p className="text-zinc-400 mb-4">Ready to order? Head straight to checkout with our signature flavor.</p>
            <a 
              href="/checkout"
              className="inline-block w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              Order Blue Mist + Mint ($30.00)
            </a>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-300 mb-3">Custom Order</h3>
            <p className="text-zinc-400 mb-4">Want to customize your experience? Build your perfect hookah session.</p>
            <a 
              href="#customize"
              className="inline-block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              Customize Your Order
            </a>
          </div>
        </div>

        {/* Custom Order Form */}
        <div id="customize" className="bg-zinc-900 border border-zinc-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Customize Your Hookah Experience</h2>
          
          <div className="space-y-6">
            {/* Flavor Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Select Flavor
              </label>
              <select
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {flavors.map((flavor) => (
                  <option key={flavor} value={flavor}>
                    {flavor}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} Hookah{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or notes for your hookah session..."
                className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent h-24 resize-none"
              />
            </div>

            {/* Order Summary */}
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Flavor:</span>
                  <span className="text-white">{selectedFlavor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Quantity:</span>
                  <span className="text-white">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Price per hookah:</span>
                  <span className="text-white">$30.00</span>
                </div>
                <div className="border-t border-zinc-600 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Total:</span>
                    <span className="text-teal-400">${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Proceed to Checkout */}
            <button className="w-full py-4 px-6 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold rounded-lg text-lg transition-all transform hover:scale-105">
              Proceed to Checkout - ${calculateTotal()}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-teal-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Fast Service</h3>
            <p className="text-zinc-400">Your hookah will be ready when you arrive</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Table Reserved</h3>
            <p className="text-zinc-400">Your spot is guaranteed upon arrival</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure Payment</h3>
            <p className="text-zinc-400">Safe and encrypted payment processing</p>
          </div>
        </div>
      </div>
    </div>
  );
}