"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MenuItem } from '../components/LoungeMenu';

export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; quantity: number; specialInstructions?: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ITEMS'; payload: { items: CartItem[] } };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (item: MenuItem, quantity: number, specialInstructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  getItemTotal: (itemId: string) => number;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity, specialInstructions } = action.payload;
      const existingItem = state.items.find(cartItem => cartItem.item.id === item.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, cartItem) => sum + (cartItem.item.priceCents * cartItem.quantity), 0),
          itemCount: updatedItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
        };
      } else {
        const newItem: CartItem = { item, quantity, specialInstructions };
        const updatedItems = [...state.items, newItem];
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, cartItem) => sum + (cartItem.item.priceCents * cartItem.quantity), 0),
          itemCount: updatedItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
        };
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(cartItem => cartItem.item.id !== action.payload.itemId);
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, cartItem) => sum + (cartItem.item.priceCents * cartItem.quantity), 0),
        itemCount: updatedItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { itemId } });
      }
      
      const updatedItems = state.items.map(cartItem =>
        cartItem.item.id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      );
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, cartItem) => sum + (cartItem.item.priceCents * cartItem.quantity), 0),
        itemCount: updatedItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0
      };

    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.items.reduce((sum, cartItem) => sum + (cartItem.item.priceCents * cartItem.quantity), 0),
        itemCount: action.payload.items.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
      };

    default:
      return state;
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0
  });

  const addItem = (item: MenuItem, quantity: number, specialInstructions?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity, specialInstructions } });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (itemId: string): number => {
    const cartItem = state.items.find(item => item.item.id === itemId);
    return cartItem?.quantity || 0;
  };

  const getItemTotal = (itemId: string): number => {
    const cartItem = state.items.find(item => item.item.id === itemId);
    return cartItem ? cartItem.item.priceCents * cartItem.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        getItemTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
