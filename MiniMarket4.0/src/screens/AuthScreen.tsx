import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { countries, states, cities } from '../utils/locations';
import { validateEmail } from '../utils/validators';

type AuthMode = 'login' | 'register';

export const AuthScreen: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [emailError, setEmailError] = useState('');

  // Limpiar campos al cambiar entre login y register
  useEffect(() => {
    setUsername('');
    setEmail('');
    setPassword('');
    setPhone('');
    setAddress('');
    setCountry('');
    setState('');
    setCity('');
    setEmailError('');
  }, [mode]);

  const validatePassword = (value: string) =>
    value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);

  const validateCity = (value: string) =>
    value.length >= 3 && /^[a-záéíóúñ\s'-]+$/i.test(value);

  const handleAuth = async () => {
    try {
      // Validar email en ambos modos
      if (!email || !validateEmail(email)) {
        setEmailError('Por favor ingresa un correo electrónico válido');
        return;
      }
      setEmailError('');

      if (mode === 'login') {
        if (!password) return Alert.alert('Error', 'La contraseña es obligatoria');
        await login(email, password);
      } else {
        if (!username || !password || !phone || !address || !country || !state || !city)
          return Alert.alert('Error', 'Por favor completa todos los campos');

        if (!validatePassword(password))
          return Alert.alert(
            'Contraseña inválida',
            'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número'
          );

        // Validar que la ciudad sea válida (sin símbolos especiales)
        if (!validateCity(city)) {
          return Alert.alert('Ciudad inválida', 'La ciudad debe tener mínimo 3 caracteres y solo puede contener letras, espacios y apóstrofes');
        }

        await register(username, email, password, phone, address, country, state, city);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Ocurrió un error');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MiniMarket App</Text>
        <Text style={styles.subtitle}>{mode === 'login' ? 'Inicia sesión' : 'Regístrate'}</Text>

        <View style={styles.form}>
          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              value={username}
              onChangeText={setUsername}
              editable={!isLoading}
            />
          )}

          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
          />

          {mode === 'register' && (
            <Text style={styles.passwordHint}>
              La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número
            </Text>
          )}

          {mode === 'register' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textContentType="none"
                autoComplete="off"
              />
              <TextInput
                style={styles.input}
                placeholder="Dirección"
                value={address}
                onChangeText={setAddress}
                textContentType="none"
                autoComplete="off"
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>País</Text>
                <Picker
                  selectedValue={country}
                  onValueChange={(value) => {
                    setCountry(value);
                    setState('');
                    setCity('');
                  }}
                >
                  <Picker.Item label="Selecciona un país" value="" />
                  {countries.map((item) => (
                    <Picker.Item key={item.value} label={item.label} value={item.value} />
                  ))}
                </Picker>
              </View>

              {country && (
                <View style={styles.pickerContainer}>
                  <Text style={styles.label}>Estado</Text>
                  <Picker
                    selectedValue={state}
                    onValueChange={(value) => {
                      setState(value);
                      setCity('');
                    }}
                  >
                    <Picker.Item label="Selecciona un estado" value="" />
                    {states[country]?.map((item) => (
                      <Picker.Item key={item.value} label={item.label} value={item.value} />
                    ))}
                  </Picker>
                </View>
              )}

              {state && (
                <TextInput
                  style={styles.input}
                  placeholder="Ciudad"
                  value={city}
                  onChangeText={setCity}
                  editable={!isLoading}
                  textContentType="none"
                  autoComplete="off"
                />
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  inputError: { borderColor: '#ff3333', borderWidth: 2 },
  errorText: { color: '#ff3333', fontSize: 12, marginBottom: 12, marginTop: -8 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 30 },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 3 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  passwordHint: { fontSize: 12, color: '#666', marginBottom: 12 },
  pickerContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  button: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  toggleText: { color: '#007AFF', textAlign: 'center', marginTop: 20 },
});
