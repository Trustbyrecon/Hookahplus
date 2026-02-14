'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ShoppingCart, Plus, Minus, Mail, Phone, CheckCircle } from 'lucide-react';

interface CigarProduct {
  id: string;
  name: string;
  blend: string;
  sizes: Array<{ size: string; price: number }>;
  notes: string;
  description: string;
}

interface CartItem {
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
}

const products: CigarProduct[] = [
  {
    id: '1',
    name: 'Roberto James Signature',
    blend: 'Nicaraguan Habano',
    sizes: [
      { size: 'Robusto (5" x 50)', price: 18 },
      { size: 'Toro (6" x 52)', price: 22 },
      { size: 'Churchill (7" x 48)', price: 25 }
    ],
    notes: 'Cedar, leather, dark chocolate',
    description: 'Our flagship blend with rich, bold flavors perfect for any occasion.'
  },
  {
    id: '2',
    name: 'Reserva Especial',
    blend: 'Ecuadorian Connecticut',
    sizes: [
      { size: 'Robusto (5" x 50)', price: 16 },
      { size: 'Toro (6" x 52)', price: 20 }
    ],
    notes: 'Cream, vanilla, light spice',
    description: 'Smooth and creamy with a delicate wrapper for a refined experience.'
  },
  {
    id: '3',
    name: 'Maduro Reserve',
    blend: 'San Andrés Maduro',
    sizes: [
      { size: 'Robusto (5" x 50)', price: 20 },
      { size: 'Toro (6" x 52)', price: 24 },
      { size: 'Gordo (6" x 60)', price: 26 }
    ],
    notes: 'Coffee, cocoa, sweet tobacco',
    description: 'Bold and rich with a dark, oily wrapper delivering complex flavors.'
  },
  {
    id: '4',
    name: 'Connecticut Shade',
    blend: 'Connecticut Shade',
    sizes: [
      { size: 'Corona (5.5" x 42)', price: 14 },
      { size: 'Robusto (5" x 50)', price: 16 }
    ],
    notes: 'Hay, cream, light pepper',
    description: 'Mild and smooth, perfect for beginners or a morning smoke.'
  },
  {
    id: '5',
    name: 'Habano Clásico',
    blend: 'Cuban-seed Habano',
    sizes: [
      { size: 'Robusto (5" x 50)', price: 19 },
      { size: 'Toro (6" x 52)', price: 23 }
    ],
    notes: 'Pepper, earth, wood',
    description: 'Classic Cuban-style blend with medium to full body and rich complexity.'
  }
];

export default function RobertoJamesPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [showCart, setShowCart] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const addToCart = (product: CigarProduct) => {
    const sizeKey = selectedSizes[product.id] || product.sizes[0].size;
    const selectedSize = product.sizes.find(s => s.size === sizeKey) || product.sizes[0];
    
    const existingItem = cart.find(
      item => item.productId === product.id && item.size === selectedSize.size
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id && item.size === selectedSize.size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        size: selectedSize.size,
        price: selectedSize.price,
        quantity: 1
      }]);
    }
    
    // Visual feedback
    setShowCart(true);
    setTimeout(() => setShowCart(false), 2000);
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId && item.size === size) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Visual only - no actual submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
      setPhone('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-32 h-32 border-2 border-red-600/30 rounded-full"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 relative z-10" style={{ 
            fontFamily: 'cursive, serif',
            color: '#dc2626',
            textShadow: '0 0 20px rgba(220, 38, 38, 0.3)'
          }}>
            Roberto James Cigars
          </h1>
          <p className="text-zinc-300 text-xl md:text-2xl italic mb-2 relative z-10" style={{ fontFamily: 'serif' }}>
            Handcrafted Cigars with Timeless
          </p>
          <p className="text-zinc-300 text-xl md:text-2xl italic relative z-10" style={{ fontFamily: 'serif' }}>
            Tradition and Modern Sophistication
          </p>
        </div>

        {/* Cart Button */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-zinc-900/90 backdrop-blur-sm border border-red-600/30 hover:border-red-600/50 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 transition-all hover:bg-zinc-800/90"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Cart Drawer */}
        {showCart && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-end sm:items-center sm:justify-center">
            <Card className="w-full sm:w-96 max-h-[80vh] overflow-y-auto bg-zinc-900 border-red-600/30 m-4 shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-red-600/20 pb-4">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'serif' }}>Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-zinc-400 hover:text-white text-2xl leading-none transition-colors"
                >
                  ×
                </button>
              </div>
              
              {cart.length === 0 ? (
                <p className="text-zinc-400 text-center py-12 italic">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-6 mb-6">
                    {cart.map((item, idx) => (
                      <div key={idx} className="border-b border-red-600/20 pb-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-lg mb-1">{item.productName}</p>
                            <p className="text-sm text-zinc-400">{item.size}</p>
                          </div>
                          <p className="font-semibold text-lg">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, -1)}
                            className="w-9 h-9 rounded border border-red-600/30 hover:border-red-600/50 hover:bg-red-600/10 flex items-center justify-center transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, 1)}
                            className="w-9 h-9 rounded border border-red-600/30 hover:border-red-600/50 hover:bg-red-600/10 flex items-center justify-center transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-red-600/20 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xl font-semibold" style={{ fontFamily: 'serif' }}>Total</span>
                      <span className="text-2xl font-bold text-red-500">${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 border border-red-500 shadow-lg"
                      onClick={() => alert('Checkout functionality would be integrated here')}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {/* Product Catalog */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-10 text-center" style={{ fontFamily: 'serif' }}>
            Our Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="bg-zinc-900/80 backdrop-blur-sm border-red-600/20 hover:border-red-600/40 transition-all shadow-xl hover:shadow-2xl group">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-red-500 group-hover:text-red-400 transition-colors" style={{ fontFamily: 'serif' }}>
                    {product.name}
                  </h3>
                  <p className="text-zinc-300 text-sm mb-3 uppercase tracking-wider">{product.blend}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{product.description}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-zinc-300 uppercase tracking-wide">Size</label>
                  <select
                    value={selectedSizes[product.id] || product.sizes[0].size}
                    onChange={(e) => setSelectedSizes({ ...selectedSizes, [product.id]: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-red-600/30 rounded-lg text-white text-sm focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all"
                  >
                    {product.sizes.map((size) => (
                      <option key={size.size} value={size.size}>
                        {size.size} - ${size.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6 pb-6 border-b border-red-600/20">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Tasting Notes</p>
                  <p className="text-sm text-zinc-300 italic leading-relaxed">{product.notes}</p>
                </div>

                <Button
                  onClick={() => addToCart(product)}
                  className="w-full bg-red-600 hover:bg-red-700 border border-red-500 text-white shadow-lg hover:shadow-xl transition-all"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add to Cart
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-red-600/30 shadow-2xl backdrop-blur-sm">
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-3" style={{ fontFamily: 'serif' }}>Thank You!</h3>
              <p className="text-zinc-300 text-lg">
                We'll keep you updated on new blends and upcoming pop-ups.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold mb-3 text-center" style={{ fontFamily: 'serif' }}>Join Our List</h2>
              <p className="text-zinc-400 text-center mb-8 text-lg">
                Get notified about new blends, special events, and exclusive offers
              </p>
              <form onSubmit={handleContactSubmit} className="max-w-md mx-auto space-y-5">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-5 py-4 bg-zinc-800/50 border border-red-600/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number (optional)"
                    className="w-full px-5 py-4 bg-zinc-800/50 border border-red-600/30 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 border border-red-500 text-white shadow-lg hover:shadow-xl transition-all"
                  leftIcon={<Mail className="w-5 h-5" />}
                >
                  Join List
                </Button>
              </form>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-red-600/20 text-center text-zinc-400 text-sm">
          <p className="mb-2">Questions? Reach out at{' '}
            <a href="mailto:info@robertojamescigars.com" className="text-red-500 hover:text-red-400 transition-colors">
              info@robertojamescigars.com
            </a>
          </p>
          <p className="text-zinc-500 text-xs">
            Powered by Hookah+ • Pop-up & Event Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}

