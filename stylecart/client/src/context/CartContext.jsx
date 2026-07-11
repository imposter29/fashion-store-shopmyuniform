import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // TODO: implement — placeholder mock functions.
  const fetchCart = async () => {
    // const { data } = await api.get('/cart');
    // setItems(data);
    return { message: 'TODO' };
  };

  const addToCart = async (product, size, quantity = 1) => {
    return { message: 'TODO' };
  };

  const updateItem = async (itemId, quantity) => {
    return { message: 'TODO' };
  };

  const removeItem = async (itemId) => {
    return { message: 'TODO' };
  };

  const clearCart = async () => {
    setItems([]);
    return { message: 'TODO' };
  };

  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const subtotal = items.reduce(
    (sum, i) => sum + (i.product?.price || 0) * (i.quantity || 0),
    0
  );

  const value = {
    items,
    loading,
    itemCount,
    subtotal,
    fetchCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    setItems,
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
