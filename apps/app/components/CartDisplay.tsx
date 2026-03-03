"use client";

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  X,
  Edit3
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartDisplayProps {
  className?: string;
  onCheckout?: () => void;
  onEditItem?: (itemId: string) => void;
}

export const CartDisplay: React.FC<CartDisplayProps> = ({
  className,
  onCheckout,
  onEditItem
}) => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (priceCents: number): string => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      // Default checkout behavior
      console.log('Proceeding to checkout with items:', state.items);
    }
  };

  if (state.itemCount === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <ShoppingCart className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
        <p className="text-zinc-400 text-lg">Your cart is empty</p>
        <p className="text-zinc-500 text-sm">Add some items to get started</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Cart Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white">Cart</h3>
          <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
            {state.itemCount}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {isExpanded ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
          {state.itemCount > 0 && (
            <button
              onClick={clearCart}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Clear cart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      {isExpanded && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {state.items.map((cartItem) => (
            <div
              key={cartItem.item.id}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{cartItem.item.name}</h4>
                  <p className="text-sm text-zinc-400">
                    {formatPrice(cartItem.item.priceCents)} each
                  </p>
                  {cartItem.specialInstructions && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Note: {cartItem.specialInstructions}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-teal-400">
                    {formatPrice(cartItem.item.priceCents * cartItem.quantity)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity - 1)}
                    className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-white font-medium min-w-[2rem] text-center">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity + 1)}
                    className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {onEditItem && (
                    <button
                      onClick={() => onEditItem(cartItem.item.id)}
                      className="p-1 text-zinc-400 hover:text-white transition-colors"
                      title="Edit item"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(cartItem.item.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Summary */}
      <div className="border-t border-zinc-700 pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-white">Total</span>
          <span className="text-xl font-bold text-teal-400">
            {formatPrice(state.total)}
          </span>
        </div>

        <button
          onClick={handleCheckout}
          className="w-full flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          <CreditCard className="w-5 h-5" />
          <span>Proceed to Checkout</span>
        </button>
      </div>
    </div>
  );
};
