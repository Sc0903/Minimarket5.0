import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart, CartItem } from '../context/CartContext';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  const handleRemoveFromCart = (cartItemId: string, productName: string) => {
    Alert.alert(
      'Remover producto',
      `¿Estás seguro de que quieres remover "${productName}" del carrito?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFromCart(cartItemId),
        },
      ]
    );
  };

  const handleQuantityChange = (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveFromCart(cartItemId, 'este producto');
      return;
    }
    updateQuantity(cartItemId, quantity);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Vaciar carrito',
      '¿Estás seguro de que quieres vaciar todo el carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar',
          style: 'destructive',
          onPress: clearCart,
        },
      ]
    );
  };

  const handleCheckout = () => {
    navigation.navigate('Payment');
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.itemInfo}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.itemSeller}>{item.seller_username}</Text>
        </View>

        <View style={styles.itemInfo}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.itemLocation}>
            {item.seller_country}, {item.seller_state}
          </Text>
        </View>

        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>

      <View style={styles.quantityControls}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() =>
              handleQuantityChange(item.id, item.quantity - 1)
            }
          >
            <Ionicons name="remove" size={16} color="#007AFF" />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() =>
              handleQuantityChange(item.id, item.quantity + 1)
            }
          >
            <Ionicons name="add" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() =>
            handleRemoveFromCart(item.id, item.name)
          }
        >
          <Ionicons name="trash-outline" size={18} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-handle-outline" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>
            Agrega productos desde la lista de productos
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.cartHeader}>
            <Text style={styles.cartHeaderText}>
              {getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'}
            </Text>
          </View>

          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>
                ${getTotalPrice().toFixed(2)}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearCart}
              >
                <Text style={styles.clearButtonText}>Vaciar carrito</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>
                  Proceder al pago
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default CartScreen;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  cartHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },

  cartHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },

  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },

  cartList: {
    padding: 20,
    paddingBottom: 140,
  },

  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    elevation: 4,
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#eee',
  },

  itemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },

  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  itemSeller: {
    fontSize: 12,
    marginLeft: 6,
    color: '#666',
  },

  itemLocation: {
    fontSize: 12,
    marginLeft: 6,
    color: '#666',
  },

  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 6,
  },

  quantityControls: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  quantityButton: {
    padding: 6,
  },

  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },

  removeButton: {
    marginTop: 10,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },

  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dc3545',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  clearButtonText: {
    color: '#dc3545',
    fontWeight: '600',
  },

  checkoutButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
