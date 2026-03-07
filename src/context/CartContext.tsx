import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { saveCartToVault, getUserDossier } from '../services/userService';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalPrice: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 1. REACTION: When User logs in or out, handle the Sack switch
  useEffect(() => {
    if (authLoading) return;

    const manageSackTransition = async () => {
      if (user) {
        // KNIGHT LOGGED IN: Try to load their specific local sack first
        const localSack = localStorage.getItem(`rt-sack-${user.id}`);
        if (localSack) {
          setCart(JSON.parse(localSack));
        } else {
          // If no local, fetch from the cloud dossier
          const dossier = await getUserDossier(user.id);
          setCart(dossier?.cart || []);
        }
      } else {
        // GUEST OR LOGOUT: Empty the UI sack immediately
        // If you want a "Guest Cart" that persists, use `rt-sack-guest`
        // But per your request, logout should empty the cart.
        setCart([]);
      }
      setIsInitialLoad(false);
    };

    manageSackTransition();
  }, [user?.id, authLoading]);

  // 2. PERSISTENCE: Save changes to the CURRENT user's specific key
  useEffect(() => {
    if (isInitialLoad || authLoading) return;

    if (user) {
      // Save to local storage for this specific account
      localStorage.setItem(`rt-sack-${user.id}`, JSON.stringify(cart));
      
      // Sync to cloud with a debounce
      const timer = setTimeout(() => {
        saveCartToVault(user.id, cart);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Optional: Save guest cart if desired
      localStorage.setItem('rt-sack-guest', JSON.stringify(cart));
    }
  }, [cart, user?.id, isInitialLoad, authLoading]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    if (user) {
      localStorage.removeItem(`rt-sack-${user.id}`);
      saveCartToVault(user.id, []);
    } else {
      localStorage.removeItem('rt-sack-guest');
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
};