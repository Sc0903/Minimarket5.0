import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { uploadProductImage } from '../utils/uploadImage';

export const CreateProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addProduct, loading } = useProduct();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');

  const selectImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu galería para seleccionar imágenes'
        );
        return;
      }

      // Abrir selector de imágenes
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

  const handleCreate = async () => {
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
      // Subir imagen a Supabase
      let imageUrl = image;
      if (!image.startsWith('http')) {
        // Es una URI local, subir a Supabase
        Alert.alert('Publicando', 'Subiendo imagen...');
        imageUrl = await uploadProductImage(image, user?.id || '');
      }

      await addProduct(name.trim(), priceNum, description.trim(), imageUrl, stockNum);
      Alert.alert(
        '¡Producto publicado!',
        `Tu producto "${name}" se ha publicado en ${user?.country}, ${user?.state}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo publicar el producto. Inténtalo de nuevo.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Publicar Nuevo Producto</Text>

        {/* Información de ubicación */}
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>📍 Ubicación de publicación</Text>
          <Text style={styles.locationText}>
            {user?.country}, {user?.state}
          </Text>
          <Text style={styles.locationNote}>
            Tu producto será visible para compradores en esta ubicación
          </Text>
        </View>

        <Text style={styles.label}>Nombre del producto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Laptop Dell Inspiron"
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
          placeholder="Cantidad disponible"
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe detalladamente tu producto, condición, características, etc."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Imagen</Text>
        <TouchableOpacity style={styles.imageUpload} onPress={selectImage}>
          <Text style={styles.imageUploadText}>
            {image ? 'Cambiar imagen' : 'Seleccionar imagen'}
          </Text>
        </TouchableOpacity>

        {image ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.preview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage('')}>
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Publicando...' : 'Publicar producto'}
          </Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  locationInfo: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  locationNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
  imagePreview: {
    position: 'relative',
    marginTop: 12,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
