import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;              // id del cartitem
  product_id: string;
  name: string;
  price: number;
  image: string;
  seller_username: string;
  seller_country: string;
  seller_state: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /* ==============================
     CARGAR CARRITO (MEMOIZADO)
  ============================== */
  const loadCart = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cartitem')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setCartItems(data);
      }
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /* ==============================
     AGREGAR PRODUCTO (MEMOIZADO)
  ============================== */
  const addToCart = useCallback(async (product: any) => {
    if (!user) return;

    const existing = cartItems.find(
      item => item.product_id === product.id
    );

    if (existing) {
      await updateQuantity(existing.id, existing.quantity + 1);
      return;
    }

    await supabase.from('cartitem').insert({
      user_id: user.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      seller_username: product.sellerUsername,
      seller_country: product.sellerCountry,
      seller_state: product.sellerState,
      quantity: 1,
    });

    await loadCart();
  }, [user, cartItems, loadCart]);

  /* ==============================
     ELIMINAR ITEM (MEMOIZADO)
  ============================== */
  const removeFromCart = useCallback(async (cartItemId: string) => {
    await supabase
      .from('cartitem')
      .delete()
      .eq('id', cartItemId);

    await loadCart();
  }, [loadCart]);

  /* ==============================
     ACTUALIZAR CANTIDAD (MEMOIZADO)
  ============================== */
  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    await supabase
      .from('cartitem')
      .update({ quantity })
      .eq('id', cartItemId);

    await loadCart();
  }, [loadCart, removeFromCart]);

  /* ==============================
     VACIAR CARRITO (MEMOIZADO)
  ============================== */
  const clearCart = useCallback(async () => {
    if (!user) return;

    await supabase
      .from('cartitem')
      .delete()
      .eq('user_id', user.id);

    setCartItems([]);
  }, [user]);

  const getTotalPrice = useCallback(() =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const getTotalItems = useCallback(() =>
    cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
