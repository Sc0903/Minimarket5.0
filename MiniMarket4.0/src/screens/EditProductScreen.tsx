import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { uploadProductImage } from '../utils/uploadImage';

export const EditProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { productId } = route.params as { productId: string };
  const { products, updateProduct, loading } = useProduct();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [originalImage, setOriginalImage] = useState('');

  useEffect(() => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setName(product.name || '');
      setPrice(product.price?.toString() || '');
      setDescription(product.description || '');
      setOriginalImage(product.image || '');
      setStock(product.stock?.toString() || '');
      setImage(product.image || '');
    }
  }, [productId, products]);

  const selectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleUpdate = async () => {
    if (!name.trim() || !price.trim() || !description.trim() || !stock.trim() || !image.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Por favor ingresa un precio válido');
      return;
    }

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum <= 0) {
      Alert.alert('Error', 'Por favor ingresa un stock válido (números enteros positivos)');
      return;
    }

    try {
      // Subir imagen si es nueva
      let imageUrl = image;
      if (!image.startsWith('http') && image !== originalImage) {
        // Es una URI local nueva, subir a Supabase
        Alert.alert('Actualizando', 'Subiendo imagen...');
        imageUrl = await uploadProductImage(image, user?.id || '');
      }

      await updateProduct(productId, name.trim(), priceNum, description.trim(), imageUrl, stockNum);
      Alert.alert('¡Éxito!', 'Producto actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo actualizar el producto. Inténtalo de nuevo.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Nombre del producto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Laptop"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Precio</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 99.99"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Stock</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 10"
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe tu producto"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Imagen</Text>
        <TouchableOpacity style={styles.imageUpload} onPress={selectImage}>
          <Text style={styles.imageUploadText}>Cambiar imagen</Text>
        </TouchableOpacity>

        {image && (
          <Image source={{ uri: image }} style={styles.preview} />
        )}

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={loading}>
          <Text style={styles.updateButtonText}>{loading ? 'Actualizando...' : 'Actualizar producto'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 14,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  imageUpload: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  imageUploadText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
