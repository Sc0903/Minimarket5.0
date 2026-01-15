import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { usePurchases } from '../context/PurchaseContext';

export const MyPurchasesScreen: React.FC = () => {
  const { purchases, loading, fetchPurchases } = usePurchases();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.purchaseCard}>
      <Image source={{ uri: item.product_image }} style={styles.productImage} />
      <View style={styles.purchaseInfo}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.price}>
          ${item.price.toFixed(2)} x {item.quantity}
        </Text>
        <Text style={styles.status}>Estado: {item.status}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando compras...</Text>
      </View>
    );
  }

  if (purchases.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tienes compras realizadas</Text>
        <Text style={styles.emptySubtext}>
          Comienza a explorar productos disponibles
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={purchases}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContainer: { padding: 16, paddingBottom: 40 },
  purchaseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: { width: 100, height: 100, backgroundColor: '#e0e0e0' },
  purchaseInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  productName: { fontSize: 16, fontWeight: '600', color: '#333' },
  price: { fontSize: 14, fontWeight: '700', color: '#007AFF', marginTop: 4 },
  status: { fontSize: 12, color: '#666', marginTop: 4 },
  date: { fontSize: 12, color: '#999', marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginBottom: 8, textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
});
