import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { Product } from '../types';
import uuid from 'react-native-uuid';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  addProduct: (
    name: string,
    price: number,
    description: string,
    image: string,
    stock: number
  ) => Promise<void>;
  updateProduct: (
    productId: string,
    name: string,
    price: number,
    description: string,
    image: string,
    stock: number
  ) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔄 CARGAR PRODUCTOS (CORREGIDO)
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        image: p.image,
        stock: p.stock,
        sellerId: p.seller_id,
        sellerUsername: p.seller_username,
        sellerPhone: p.seller_phone,
        sellerCountry: p.seller_country,
        sellerState: p.seller_state,
        createdAt: p.created_at,
      }));

      setProducts(mappedProducts);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  // ➕ CREAR PRODUCTO
  const addProduct = useCallback(
    async (
      name: string,
      price: number,
      description: string,
      image: string,
      stock: number
    ) => {
      if (!user) return;

      setLoading(true);
      try {
        const { error } = await supabase.from('product').insert([
          {
            id: uuid.v4().toString(),
            name,
            price,
            description,
            image,
            stock,
            seller_id: user.id,
            seller_username: user.username,
            seller_phone: user.phone,
            seller_country: user.country,
            seller_state: user.state,
          },
        ]);

        if (error) throw error;

        await loadProducts();
      } catch (err) {
        console.error(err);
        setError('Error al crear producto');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, loadProducts]
  );

  // ✏️ EDITAR PRODUCTO
  const updateProduct = useCallback(
    async (
      productId: string,
      name: string,
      price: number,
      description: string,
      image: string,
      stock: number
    ) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('product')
          .update({ name, price, description, image, stock })
          .eq('id', productId);

        if (error) throw error;

        await loadProducts();
      } catch (err) {
        console.error(err);
        setError('Error al actualizar producto');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadProducts]
  );

  // 🗑️ ELIMINAR PRODUCTO
  const deleteProduct = useCallback(
    async (productId: string) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('product')
          .delete()
          .eq('id', productId);

        if (error) throw error;

        await loadProducts();
      } catch (err) {
        console.error(err);
        setError('Error al eliminar producto');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadProducts]
  );

  // ⚠️ FIX: Solo cargar productos una vez al montar (sin dependencias)
  // Previene loops infinitos y recarga excesiva
  useEffect(() => {
    loadProducts();
  }, []); // Array vacío: solo se ejecuta al montar

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct debe usarse dentro de ProductProvider');
  }
  return context;
};
