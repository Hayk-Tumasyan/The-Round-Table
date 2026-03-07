import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext'; // Import to know which user is shopping
import { saveCartToVault, getUserDossier } from '../services/userService'; // Import DB tools

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
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // A safety flag to prevent overwriting the cloud with empty local data during startup
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // --- NEW PERSISTENCE LOGIC START ---

  // 1. QUEST: Load the sack from the cloud when the Knight enters the realm
  useEffect(() => {
    const loadSavedSack = async () => {
      if (user) {
        const dossier = await getUserDossier(user.id);
        if (dossier && dossier.cart) {
          setCart(dossier.cart);
        }
      } else {
        setCart([]); // If no user is logged in, show an empty sack
      }
      setIsInitialLoad(false); // Gateway opened: we can now save changes to cloud
    };
    loadSavedSack();
  }, [user?.id]);

  // 2. QUEST: Automatically sync every change in the sack to the cloud
  useEffect(() => {
    // Only save if a user exists and we have finished the initial download
    if (!user || isInitialLoad) return;
    
    const syncTimer = setTimeout(() => {
      saveCartToVault(user.id, cart);
    }, 500); // Wait 0.5s after the last click to avoid database spam

    return () => clearTimeout(syncTimer);
  }, [cart, user, isInitialLoad]);

  // --- NEW PERSISTENCE LOGIC END ---

  // ALL ORIGINAL FUNCTIONS PRESERVED BELOW
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
    // Immediately clear in cloud if user is logged in
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