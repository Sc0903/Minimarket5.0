import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';
import uuid from 'react-native-uuid';
import { STORAGE_KEYS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export const useProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      setProducts(data ? JSON.parse(data) : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(
    async (name: string, price: number, description: string, image: string) => {
      if (!user) return;

      setLoading(true);
      try {
        const newProduct: Product = {
          id: uuid.v4().toString(),
          name,
          price,
          description,
          image,
          sellerId: user.id,
          sellerUsername: user.username,
          sellerCountry: user.country,
          sellerState: user.state,
          createdAt: new Date().toISOString(),
        };

        const currentProducts = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
        const allProducts = currentProducts ? JSON.parse(currentProducts) : [];
        allProducts.push(newProduct);

        await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(allProducts));
        setProducts(allProducts);
        setError(null);
      } catch (err) {
        setError('Error al crear producto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const updateProduct = useCallback(
    async (productId: string, name: string, price: number, description: string, image: string) => {
      setLoading(true);
      try {
        const currentProducts = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
        const allProducts = currentProducts ? JSON.parse(currentProducts) : [];

        const updatedProducts = allProducts.map((p: Product) =>
          p.id === productId
            ? { ...p, name, price, description, image }
            : p
        );

        await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
        setError(null);
      } catch (err) {
        setError('Error al actualizar producto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteProduct = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const currentProducts = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const allProducts = currentProducts ? JSON.parse(currentProducts) : [];

      const updatedProducts = allProducts.filter((p: Product) => p.id !== productId);

      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      setError(null);
    } catch (err) {
      setError('Error al eliminar producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
