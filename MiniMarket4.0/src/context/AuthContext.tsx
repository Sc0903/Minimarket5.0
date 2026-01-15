import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../config/supabase';
import { AuthContextType, User } from '../types';
import bcrypt from 'bcryptjs';

// Fallback para React Native
bcrypt.setRandomFallback((len) => {
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) buf[i] = Math.floor(Math.random() * 256);
  return buf;
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ======================
  // REGISTER
  // ======================
  const register = async (
    username: string,
    email: string,
    password: string,
    phone: string,
    address: string,
    country: string,
    state: string,
    city: string
  ) => {
    setIsLoading(true);
    try {
      // Validar existencia
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${username},email.eq.${email}`)
        .single();

      if (existingUser) throw new Error('El usuario o correo ya existe');

      // Validar contraseña
      if (password.length < 6)
        throw new Error('La contraseña debe tener al menos 6 caracteres');

      const hashedPassword = bcrypt.hashSync(password, 10);

      const { data, error } = await supabase
        .from('users')
        .insert([
          { username, email, password: hashedPassword, phone, address, country, state, city },
        ])
        .select()
        .single();

      if (error || !data) throw error;

      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        phone: data.phone,
        address: data.address,
        country: data.country,
        state: data.state,
        city: data.city,
        createdAt: data.created_at,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ======================
  // LOGIN
  // ======================
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) throw new Error('Usuario no encontrado');

      const isPasswordValid = bcrypt.compareSync(password, data.password);
      if (!isPasswordValid) throw new Error('Contraseña incorrecta');

      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        phone: data.phone,
        address: data.address,
        country: data.country,
        state: data.state,
        city: data.city,
        createdAt: data.created_at,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ======================
  // LOGOUT
  // ======================
  const logout = () => setUser(null);

  // ======================
  // UPDATE PROFILE
  // ======================
  const updateProfile = async (updates: Partial<User> & { newPassword?: string }) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updatedData: Partial<User> = { ...updates };

      // Si se quiere cambiar la contraseña
      if (updates.newPassword) {
        if (updates.newPassword.length < 6)
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        updatedData.password = bcrypt.hashSync(updates.newPassword, 10);
      }

      const { data, error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Actualiza el estado local
      setUser({ ...user, ...updatedData, createdAt: data.created_at });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isSignedIn: !!user, isLoading, register, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
