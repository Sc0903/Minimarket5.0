import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Purchase } from '../types';
import uuid from 'react-native-uuid';
import { STORAGE_KEYS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export const usePurchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASES);
      setPurchases(data ? JSON.parse(data) : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar compras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPurchase = useCallback(
    async (productId: string, productName: string, price: number, sellerId: string) => {
      if (!user) return;

      setLoading(true);
      try {
        const newPurchase: Purchase = {
          id: uuid.v4().toString(),
          productId,
          productName,
          price,
          buyerId: user.id,
          sellerId,
          purchasedAt: new Date().toISOString(),
          status: 'pending',
        };

        const currentPurchases = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASES);
        const allPurchases = currentPurchases ? JSON.parse(currentPurchases) : [];
        allPurchases.push(newPurchase);

        await AsyncStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(allPurchases));
        setPurchases(allPurchases);
        setError(null);
      } catch (err) {
        setError('Error al crear compra');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getSellerPurchases = useCallback(() => {
    return purchases.filter(purchase => purchase.sellerId === user?.id);
  }, [purchases, user]);

  return {
    purchases,
    loading,
    error,
    loadPurchases,
    addPurchase,
    getSellerPurchases,
  };
};