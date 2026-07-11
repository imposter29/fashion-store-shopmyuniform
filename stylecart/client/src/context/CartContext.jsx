import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCartItems(data);
      return data;
    } catch {
      setCartItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the cart when a user is present; clear it when logged out.
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [user, refreshCart]);

  const addToCart = useCallback(
    async (productId, size, quantity = 1) => {
      await api.post('/cart', { productId, size, quantity });
      await refreshCart();
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      await api.put(`/cart/${itemId}`, { quantity });
      await refreshCart();
    },
    [refreshCart]
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      await api.delete(`/cart/${itemId}`);
      await refreshCart();
    },
    [refreshCart]
  );

  const clearCart = useCallback(async () => {
    await api.delete('/cart');
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const cartTotal = cartItems.reduce(
    (sum, i) => sum + (i.product?.price || 0) * (i.quantity || 0),
    0
  );

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

export default CartContext;
