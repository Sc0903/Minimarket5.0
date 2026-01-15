import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { countries, states } from '../utils/locations';
import { validateEmail } from '../utils/validators';

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    country: user?.country || '',
    state: user?.state || '',
    city: user?.city || '',
    newPassword: '', // Opcional, no obligatorio
  });

  const handleSave = async () => {
    try {
      // Validar correo
      if (!editedUser.email || !validateEmail(editedUser.email)) {
        return Alert.alert('Correo inválido', 'Por favor ingresa un correo electrónico válido');
      }

      // Validar teléfono (solo números, entre 7 y 15 dígitos)
      const phoneDigits = editedUser.phone.replace(/\D/g, '');
      if (!editedUser.phone || !/^\d+$/.test(editedUser.phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
        return Alert.alert('Teléfono inválido', 'El teléfono debe tener solo números (entre 7 y 15 dígitos)');
      }

      // Validar ciudad (mínimo 3 caracteres, sin símbolos especiales)
      if (!editedUser.city || editedUser.city.length < 3 || !/^[a-záéíóúñ\s'-]+$/i.test(editedUser.city)) {
        return Alert.alert('Ciudad inválida', 'La ciudad debe tener mínimo 3 caracteres y solo puede contener letras, espacios y apóstrofes');
      }

      const updates: any = { ...editedUser };
      // Solo enviar newPassword si fue llenado
      if (!editedUser.newPassword) delete updates.newPassword;

      await updateProfile(updates);
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo actualizar');
    }
  };

  const handleCancel = () => {
    setEditedUser({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      country: user?.country || '',
      state: user?.state || '',
      city: user?.city || '',
      newPassword: '',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.location}>📍 {user?.country}, {user?.state}</Text>
      </View>

      <View style={styles.infoSection}>
        {/* Usuario */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Usuario:</Text>
          <TextInput
            style={styles.input}
            value={editedUser.username}
            onChangeText={(text) => setEditedUser({ ...editedUser, username: text })}
            editable={isEditing}
          />
        </View>

        {/* Correo */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Correo:</Text>
          <TextInput
            style={styles.input}
            value={editedUser.email}
            onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
            editable={isEditing}
          />
        </View>

        {/* Nueva contraseña opcional */}
        {isEditing && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nueva contraseña (opcional):</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              value={editedUser.newPassword}
              onChangeText={(text) => setEditedUser({ ...editedUser, newPassword: text })}
              secureTextEntry
            />
          </View>
        )}

        {/* Teléfono */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Teléfono:</Text>
          <TextInput
            style={styles.input}
            value={editedUser.phone}
            onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
            editable={isEditing}
          />
        </View>

        {/* Dirección */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Dirección:</Text>
          <TextInput
            style={styles.input}
            value={editedUser.address}
            onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
            editable={isEditing}
          />
        </View>

        {/* País */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>País:</Text>
          {isEditing ? (
            <Picker
              selectedValue={editedUser.country}
              onValueChange={(val) =>
                setEditedUser({ ...editedUser, country: val, state: '', city: '' })
              }
            >
              <Picker.Item label="Selecciona un país" value="" />
              {countries.map((c) => (
                <Picker.Item key={c.value} label={c.label} value={c.value} />
              ))}
            </Picker>
          ) : (
            <Text>{user?.country}</Text>
          )}
        </View>

        {/* Estado */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Estado:</Text>
          {isEditing ? (
            <Picker
              selectedValue={editedUser.state}
              enabled={!!editedUser.country}
              onValueChange={(val) => setEditedUser({ ...editedUser, state: val, city: '' })}
            >
              <Picker.Item label="Selecciona un estado" value="" />
              {editedUser.country &&
                states[editedUser.country]?.map((s) => (
                  <Picker.Item key={s.value} label={s.label} value={s.value} />
                ))}
            </Picker>
          ) : (
            <Text>{user?.state}</Text>
          )}
        </View>

        {/* Ciudad */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ciudad:</Text>
          <TextInput
            style={styles.input}
            value={editedUser.city}
            onChangeText={(text) => setEditedUser({ ...editedUser, city: text })}
            editable={isEditing}
          />
        </View>
      </View>

      <View style={styles.actions}>
        {isEditing ? (
          <>
            <TouchableOpacity style={styles.editButton} onPress={handleSave}>
              <Text style={styles.editButtonText}>Guardar cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileHeader: { backgroundColor: '#fff', paddingVertical: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  username: { fontSize: 24, fontWeight: '700', color: '#333' },
  location: { fontSize: 14, color: '#007AFF', marginTop: 4, fontWeight: '600' },
  infoSection: { backgroundColor: '#fff', marginTop: 12, padding: 16 },
  infoRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 4 },
  value: { fontSize: 14, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 8, fontSize: 14, backgroundColor: '#f9f9f9' },
  actions: { padding: 16, gap: 12, marginTop: 20 },
  editButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center' },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { backgroundColor: '#666', borderRadius: 8, padding: 14, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutButton: { backgroundColor: '#FF3B30', borderRadius: 8, padding: 14, alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
