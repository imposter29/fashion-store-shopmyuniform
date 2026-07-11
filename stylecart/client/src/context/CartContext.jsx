import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

// Guests keep their cart in localStorage until they log in, at which point it
// is merged into their server-side cart.
const GUEST_KEY = 'stylecart_guest_cart';

const readGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items) => {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota / private-mode errors */
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => readGuestCart());
  const [loading, setLoading] = useState(false);

  const fetchServerCart = useCallback(async () => {
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

  // Works for guest (local) and authenticated (server) carts.
  const refreshCart = useCallback(async () => {
    if (user) return fetchServerCart();
    const items = readGuestCart();
    setCartItems(items);
    return items;
  }, [user, fetchServerCart]);

  // React to auth changes: guests read the local cart; on login the local cart
  // is merged into the server cart and then loaded.
  useEffect(() => {
    let active = true;
    if (!user) {
      setCartItems(readGuestCart());
      return () => {
        active = false;
      };
    }
    (async () => {
      const guest = readGuestCart();
      if (guest.length) {
        setLoading(true);
        // Push each guest line into the server cart; skip any that can't be
        // added (e.g. now out of stock) rather than failing the whole merge.
        for (const item of guest) {
          try {
            await api.post('/cart', {
              productId: item.product?._id,
              size: item.size,
              quantity: item.quantity,
            });
          } catch {
            /* skip */
          }
        }
        writeGuestCart([]);
      }
      if (active) await fetchServerCart();
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addToCart = useCallback(
    async (productId, size, quantity = 1) => {
      if (user) {
        await api.post('/cart', { productId, size, quantity });
        await fetchServerCart();
        return;
      }
      // Guest: fetch the product (public endpoint) and store a snapshot locally.
      const { data: product } = await api.get(`/products/${productId}`);
      if (product.sizes?.length && !product.sizes.includes(size)) {
        throw new Error('Please select a valid size');
      }
      const items = readGuestCart();
      const existing = items.find(
        (i) => i.product?._id === productId && i.size === size
      );
      const desired = (existing ? existing.quantity : 0) + quantity;
      if (desired > product.stock) {
        throw new Error(`Only ${product.stock} in stock`);
      }
      const next = existing
        ? items.map((i) => (i === existing ? { ...i, quantity: desired } : i))
        : [
            ...items,
            { _id: `guest-${productId}-${size}`, product, size, quantity },
          ];
      writeGuestCart(next);
      setCartItems(next);
    },
    [user, fetchServerCart]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      if (user) {
        await api.put(`/cart/${itemId}`, { quantity });
        await fetchServerCart();
        return;
      }
      const items = readGuestCart();
      const target = items.find((i) => i._id === itemId);
      if (target && quantity > target.product.stock) {
        throw new Error(`Only ${target.product.stock} in stock`);
      }
      const next = items.map((i) =>
        i._id === itemId ? { ...i, quantity } : i
      );
      writeGuestCart(next);
      setCartItems(next);
    },
    [user, fetchServerCart]
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      if (user) {
        await api.delete(`/cart/${itemId}`);
        await fetchServerCart();
        return;
      }
      const next = readGuestCart().filter((i) => i._id !== itemId);
      writeGuestCart(next);
      setCartItems(next);
    },
    [user, fetchServerCart]
  );

  const clearCart = useCallback(async () => {
    if (user) {
      await api.delete('/cart');
    } else {
      writeGuestCart([]);
    }
    setCartItems([]);
  }, [user]);

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
