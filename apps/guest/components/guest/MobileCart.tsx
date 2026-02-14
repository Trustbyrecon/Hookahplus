'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Clock, Flame } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'base' | 'flavor' | 'addon';
  color?: string;
}

interface MobileCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  basePrice: number;
  sessionType: 'flat' | 'time-based';
  onSessionTypeChange: (type: 'flat' | 'time-based') => void;
}

export default function MobileCart({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  basePrice,
  sessionType,
  onSessionTypeChange
}: MobileCartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = subtotal + basePrice;

  const baseItem = items.find(item => item.type === 'base');
  const flavorItems = items.filter(item => item.type === 'flavor');
  const addonItems = items.filter(item => item.type === 'addon');

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-zinc-700">
      {/* Cart Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <div className="text-left">
            <div className="font-medium">Your Order</div>
            <div className="text-sm text-zinc-400">
              {items.length} item{items.length !== 1 ? 's' : ''} • ${(total / 100).toFixed(2)}
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Cart Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Session Type Selection */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-300">Session Type</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSessionTypeChange('flat')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      sessionType === 'flat'
                        ? 'border-teal-400 bg-teal-500/10 text-teal-300'
                        : 'border-zinc-600 bg-zinc-700/50 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-4 h-4" />
                      <span className="font-medium">Flat Rate</span>
                    </div>
                    <div className="text-xs text-zinc-400">$30.00</div>
                  </button>
                  
                  <button
                    onClick={() => onSessionTypeChange('time-based')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      sessionType === 'time-based'
                        ? 'border-teal-400 bg-teal-500/10 text-teal-300'
                        : 'border-zinc-600 bg-zinc-700/50 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Time-Based</span>
                    </div>
                    <div className="text-xs text-zinc-400">$5.00/hour</div>
                  </button>
                </div>
              </div>

              {/* Base Hookah */}
              {baseItem && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-300">Base Hookah</h4>
                  <div className="flex items-center justify-between p-3 bg-zinc-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                        <Flame className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{baseItem.name}</div>
                        <div className="text-xs text-zinc-400">
                          {sessionType === 'flat' ? 'Flat rate session' : 'Time-based session'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${(baseItem.price / 100).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Flavor Add-ons */}
              {flavorItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-300">Flavor Add-ons</h4>
                  <div className="space-y-2">
                    {flavorItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full ${item.color || 'bg-zinc-500'}`} />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-zinc-400">+${(item.price / 100).toFixed(2)} each</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                              className="w-8 h-8 bg-zinc-600 hover:bg-zinc-500 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-zinc-600 hover:bg-zinc-500 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right min-w-16">
                            <div className="font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-zinc-700">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Base Hookah:</span>
                  <span className="text-zinc-300">${(basePrice / 100).toFixed(2)}</span>
                </div>
                {flavorItems.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Flavor Add-ons:</span>
                    <span className="text-zinc-300">${(subtotal / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-700">
                  <span>Total:</span>
                  <span className="text-teal-400">${(total / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
