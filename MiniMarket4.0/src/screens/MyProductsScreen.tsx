import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProduct } from '../context/ProductContext';
import { usePurchases } from '../hooks/usePurchases';
import { useAuth } from '../context/AuthContext';

export const MyProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { products, deleteProduct } = useProduct();
  const { loadPurchases, getSellerPurchases } = usePurchases();
  const { user } = useAuth();
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // ⚠️ FIX: Solo cargar compras cuando la pantalla se monta
  useEffect(() => {
    loadPurchases();
  }, []); // Array vacío: se ejecuta una sola vez

  const myProducts = products.filter(product => product.sellerId === user?.id);
  const sellerPurchases = getSellerPurchases();

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de que quieres eliminar "${productName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(productId);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header minimalista con notificaciones */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
          {sellerPurchases.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {sellerPurchases.length > 99 ? '99+' : sellerPurchases.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Botón de Publicar nuevo producto - MOVIDO ARRIBA */}
        {myProducts.length > 0 && (
          <TouchableOpacity
            style={styles.publishNewProductButton}
            onPress={() => navigation.navigate('CreateProduct')}
          >
            <Text style={styles.publishNewProductText}>+ Publicar nuevo producto</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Sección de productos */}
        <View style={styles.productsSection}>
          {myProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No tienes productos</Text>
              <Text style={styles.emptySubtitle}>
                Publica tu primer producto para empezar a vender
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateProduct')}
              >
                <Text style={styles.createButtonText}>Publicar producto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productsList}>
              {myProducts.map((item) => (
                <View key={item.id} style={styles.productCard}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.productPrice}>${item.price}</Text>
                  </View>
                  <View style={styles.productActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteProduct(item.id, item.name)}
                    >
                      <Text style={styles.deleteButtonText}>Del</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Bandeja de Entrada */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bandeja de entrada</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {sellerPurchases.length === 0 ? (
                <View style={styles.emptyNotifications}>
                  <Text style={styles.emptyNotificationsText}>
                    No tienes ventas recientes
                  </Text>
                </View>
              ) : (
                sellerPurchases.map((purchase) => (
                  <View key={purchase.id} style={styles.saleCard}>
                    <View style={styles.saleIndicator} />
                    <View style={styles.saleInfo}>
                      <Text style={styles.saleProduct} numberOfLines={1}>
                        {purchase.productName}
                      </Text>
                      <Text style={styles.salePrice}>${purchase.price}</Text>
                      <Text style={styles.saleDate}>
                        {new Date(purchase.purchasedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  notificationIcon: {
    fontSize: 20,
    color: '#007AFF',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc3545',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  // Nuevos estilos para el botón de publicar
  publishNewProductButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: 'stretch',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  publishNewProductText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  saleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  saleIndicator: {
    width: 4,
    height: 32,
    backgroundColor: '#28a745',
    borderRadius: 2,
    marginRight: 12,
  },
  saleInfo: {
    flex: 1,
  },
  saleProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  salePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#28a745',
    marginBottom: 2,
  },
  saleDate: {
    fontSize: 12,
    color: '#666',
  },
  productsSection: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 14,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ffc107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  // Eliminado: addProductButtonBottom y addProductButtonTextBottom
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});