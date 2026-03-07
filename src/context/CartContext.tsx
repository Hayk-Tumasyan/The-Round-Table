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
  const { user } = useAuth();
  
  // 1. Immediate Hydration: Load from localStorage instantly on refresh
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedSack = localStorage.getItem('rt-sack');
    return savedSack ? JSON.parse(savedSack) : [];
  });
  
  const [isSyncing, setIsSyncing] = useState(false);

  // 2. Local Persistence: Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem('rt-sack', JSON.stringify(cart));
  }, [cart]);

  // 3. Cloud Sync (Login): When a user logs in, merge cloud cart with local cart
  useEffect(() => {
    const syncWithCloud = async () => {
      if (user && !isSyncing) {
        setIsSyncing(true);
        const dossier = await getUserDossier(user.id);
        
        if (dossier && dossier.cart && dossier.cart.length > 0) {
          // Logic: If cloud has items, use cloud. If not, push local to cloud.
          // This ensures that if you add items as a guest and then login, your items stay.
          setCart(prev => prev.length > 0 ? prev : (dossier.cart as CartItem[]));
        }
        setIsSyncing(false);
      }
    };
    syncWithCloud();
  }, [user?.id]);

  // 4. Cloud Persistence: Save to Firestore vault when logged in
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        saveCartToVault(user.id, cart);
      }, 1000); // Debounce to avoid excessive writes
      return () => clearTimeout(timer);
    }
  }, [cart, user?.id]);

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
    localStorage.removeItem('rt-sack');
    if (user) saveCartToVault(user.id, []);
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