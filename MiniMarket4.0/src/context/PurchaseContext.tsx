import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_image?: string | null;
  price: number;
  quantity: number;
  seller_id: string;
  seller_username: string;
  seller_country?: string | null;
  seller_state?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_session_id?: string | null;
  status: 'paid' | 'pending' | 'cancelled' | 'refunded';
  created_at: string;
}

interface PurchaseContextType {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  fetchPurchases: () => Promise<void>;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'created_at' | 'status'>) => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener compras del usuario (MEMOIZADO)
  const fetchPurchases = useCallback(async () => {
    if (!user || !user.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPurchases(data || []);
    } catch (err: any) {
      console.error('Error fetching purchases:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Agregar una compra (MEMOIZADO)
  const addPurchase = useCallback(async (purchase: Omit<Purchase, 'id' | 'created_at' | 'status'>) => {
    if (!user || !user.id) {
      setError('Usuario no logueado');
      console.error('No user logged in. Cannot create purchase.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('purchases')
        .insert([{
          ...purchase,
          user_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        }]);

      if (insertError) throw insertError;

      // Actualizar compras
      await fetchPurchases();
    } catch (err: any) {
      console.error('Error creating purchase:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, fetchPurchases]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return (
    <PurchaseContext.Provider value={{ purchases, loading, error, fetchPurchases, addPurchase }}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchases = (): PurchaseContextType => {
  const context = useContext(PurchaseContext);
  if (!context) throw new Error('usePurchases must be used within a PurchaseProvider');
  return context;
};
