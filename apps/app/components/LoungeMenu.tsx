"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Star, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Heart
} from 'lucide-react';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  categoryId: string;
  isActive: boolean;
  displayOrder: number;
  imageUrl?: string;
  allergens: string[];
  isPopular: boolean;
  prepTime?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  icon?: string;
  color?: string;
  items: MenuItem[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface LoungeMenuProps {
  onAddToCart: (item: MenuItem, quantity: number, specialInstructions?: string) => void;
  cartItems: CartItem[];
  onRemoveFromCart: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  className?: string;
}

export const LoungeMenu: React.FC<LoungeMenuProps> = ({
  onAddToCart,
  cartItems,
  onRemoveFromCart,
  onUpdateQuantity,
  className
}) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllergens, setShowAllergens] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/menu');
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data.categories);
          if (data.data.categories.length > 0) {
            setSelectedCategory(data.data.categories[0].id);
          }
        } else {
          setError(data.error || 'Failed to load menu');
        }
      } catch (err) {
        setError('Failed to load menu');
        console.error('Menu fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Filter items based on search and selected category
  const filteredItems = React.useMemo(() => {
    let items: MenuItem[] = [];
    
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      items = category?.items || [];
    } else {
      items = categories.flatMap(cat => cat.items);
    }

    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [categories, selectedCategory, searchQuery]);

  const getCartItemQuantity = (itemId: string): number => {
    const cartItem = cartItems.find(item => item.item.id === itemId);
    return cartItem?.quantity || 0;
  };

  const formatPrice = (priceCents: number): string => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const getCategoryColor = (color?: string): string => {
    if (!color) return 'bg-zinc-600';
    return `bg-[${color}]`;
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 mb-2">Failed to load menu</p>
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAllergens(!showAllergens)}
            className={cn(
              'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
              showAllergens
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Show Allergens</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedCategory === null
              ? 'bg-teal-600 text-white'
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          )}
        >
          All Items
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedCategory === category.id
                ? 'bg-teal-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            )}
            style={{ 
              borderColor: selectedCategory === category.id ? category.color : 'transparent',
              borderWidth: selectedCategory === category.id ? '2px' : '0px'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const cartQuantity = getCartItemQuantity(item.id);
          const isInCart = cartQuantity > 0;

          return (
            <div
              key={item.id}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors"
            >
              {/* Item Image */}
              {item.imageUrl && (
                <div className="w-full h-32 bg-zinc-700 rounded-lg mb-3 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Item Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">{item.name}</h3>
                  {item.isPopular && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-yellow-400">Popular</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-teal-400">
                    {formatPrice(item.priceCents)}
                  </div>
                  {item.prepTime && (
                    <div className="flex items-center space-x-1 text-xs text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.prepTime}min</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Description */}
              {item.description && (
                <p className="text-zinc-300 text-sm mb-3">{item.description}</p>
              )}

              {/* Allergens */}
              {showAllergens && item.allergens.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {item.allergens.map((allergen) => (
                      <span
                        key={allergen}
                        className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                {isInCart ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, cartQuantity - 1)}
                      className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-medium min-w-[2rem] text-center">
                      {cartQuantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, cartQuantity + 1)}
                      className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="p-1 bg-red-600 hover:bg-red-700 rounded text-white ml-2"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onAddToCart(item, 1)}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-400 text-lg">No items found</p>
          <p className="text-zinc-500 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};
