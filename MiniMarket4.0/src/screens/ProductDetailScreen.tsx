import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useProduct } from '../context/ProductContext';
import { usePurchases } from '../hooks/usePurchases';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const ProductDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { productId } = route.params as { productId: string };
  const { products } = useProduct();
  const { addPurchase } = usePurchases();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);

  // ⚠️ FIX: NO cargar productos aquí, ya vienen del contexto
  // Solo buscar el producto en la lista existente
  useEffect(() => {
    const foundProduct = products.find(p => p.id === productId);
    setProduct(foundProduct);
  }, [products, productId]);

  const handleBuy = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para agregar al carrito');
      return;
    }

    if (!product) return;

    Alert.alert(
      'Confirmar compra',
      `¿Estás seguro de que quieres agregar "${product.name}" al carrito?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Agregar al carrito',
          style: 'default',
          onPress: async () => {
            try {
              addToCart(product);
              Alert.alert(
                '¡Producto agregado!',
                'El producto ha sido agregado a tu carrito.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo agregar el producto. Inténtalo de nuevo.');
            }
          },
        },
      ]
    );
  };

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price}</Text>

        <View style={styles.locationSection}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              Ubicación: {product.sellerCountry}, {product.sellerState}
            </Text>
            <Text style={styles.locationNote}>
              Producto disponible en esta zona
            </Text>
          </View>
        </View>

        <View style={styles.sellerSection}>
          <Text style={styles.sellerLabel}>Vendedor:</Text>
          <Text style={styles.sellerName}>{product.sellerUsername}</Text>
          {product.sellerPhone && (
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerInfoIcon}>📱</Text>
              <Text style={styles.sellerPhoneText}>{product.sellerPhone}</Text>
            </View>
          )}
        </View>

        <Text style={styles.descriptionLabel}>Descripción:</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.buyButton}
            onPress={handleBuy}
          >
            <Text style={styles.buyButtonText}>Agregar al carrito</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
  },
  content: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 16,
  },
  locationSection: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 2,
  },
  locationNote: {
    fontSize: 12,
    color: '#666',
  },
  sellerSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sellerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sellerInfoIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  sellerPhoneText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
  },
  buyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
