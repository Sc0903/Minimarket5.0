import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { getTotalPrice, getTotalItems, clearCart } = useCart();
  const { user } = useAuth();

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.username || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || '',
  });

  const totalPrice = getTotalPrice();

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted.slice(0, 19));
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setExpiryDate(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4));
    } else {
      setExpiryDate(cleaned);
    }
  };

  const validateForm = () => {
    if (!cardNumber || cardNumber.length < 19) {
      Alert.alert('Error', 'Por favor ingresa un número de tarjeta válido');
      return false;
    }
    if (!cardName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del titular');
      return false;
    }
    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert('Error', 'Por favor ingresa una fecha de vencimiento válida');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Error', 'Por favor ingresa un CVV válido');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulación de procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Aquí irá la integración con Stripe
      Alert.alert(
        '¡Pago exitoso!',
        `Se han procesado $${totalPrice.toFixed(2)} correctamente.\n\nEn breve se conectará con Supabase para guardar tu compra.`,
        [
          {
            text: 'Aceptar',
            onPress: () => {
              clearCart();
              navigation.navigate('CartIndex');
              Alert.alert('Compra completada', 'Gracias por tu compra. Tu pedido será procesado pronto.');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el pago. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Resumen de compra */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumen de compra</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Productos:</Text>
            <Text style={styles.summaryValue}>{getTotalItems()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Impuestos:</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Información de envío */}
        <View style={styles.shippingSection}>
          <View style={styles.shippingHeader}>
            <Text style={styles.sectionTitle}>Información de envío</Text>
            <TouchableOpacity
              onPress={() => setIsEditingShipping(!isEditingShipping)}
              disabled={loading}
            >
              <Text style={styles.editLink}>
                {isEditingShipping ? 'Cancelar' : 'Editar'}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingShipping ? (
            <View style={styles.editingForm}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={shippingInfo.name}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, name: text })}
                editable={!loading}
              />

              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={styles.input}
                value={shippingInfo.address}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, address: text })}
                editable={!loading}
              />

              <Text style={styles.label}>Ciudad</Text>
              <TextInput
                style={styles.input}
                value={shippingInfo.city}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, city: text })}
                editable={!loading}
              />

              <Text style={styles.label}>Estado</Text>
              <TextInput
                style={styles.input}
                value={shippingInfo.state}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, state: text })}
                editable={!loading}
              />

              <Text style={styles.label}>País</Text>
              <TextInput
                style={styles.input}
                value={shippingInfo.country}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, country: text })}
                editable={!loading}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => setIsEditingShipping(false)}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>📍 Enviar a:</Text>
              <Text style={styles.infoText}>{shippingInfo.name}</Text>
              <Text style={styles.infoText}>{shippingInfo.address}</Text>
              <Text style={styles.infoText}>{shippingInfo.city}, {shippingInfo.state}</Text>
              <Text style={styles.infoText}>{shippingInfo.country}</Text>
            </View>
          )}
        </View>

        {/* Formulario de pago */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Información de pago</Text>

          <Text style={styles.label}>Nombre del titular</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez"
            value={cardName}
            onChangeText={setCardName}
            editable={!loading}
          />

          <Text style={styles.label}>Número de tarjeta</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={formatCardNumber}
            keyboardType="numeric"
            maxLength={19}
            editable={!loading}
          />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Vencimiento</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                value={expiryDate}
                onChangeText={formatExpiryDate}
                keyboardType="numeric"
                maxLength={5}
                editable={!loading}
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.infoBox} style={styles.testCardsInfo}>
            <Text style={styles.testCardsTitle}>🧪 Tarjetas de prueba:</Text>
            <Text style={styles.testCardText}>• 4242 4242 4242 4242 (Exitosa)</Text>
            <Text style={styles.testCardText}>• Cualquier fecha futura</Text>
            <Text style={styles.testCardText}>• Cualquier CVV de 3 dígitos</Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, loading && styles.buttonDisabled]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payButton, loading && styles.buttonDisabled]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>Procesar pago ${totalPrice.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          💳 Este es un formulario de prueba. Tus datos no serán guardados de forma segura. Se integrará Stripe después.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  summarySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  shippingSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shippingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editLink: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  editingForm: {
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  testCardsInfo: {
    backgroundColor: '#fff3cd',
    borderLeftColor: '#ffc107',
    marginTop: 16,
  },
  testCardsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 8,
  },
  testCardText: {
    fontSize: 13,
    color: '#856404',
    marginBottom: 4,
  },
  paymentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  payButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
